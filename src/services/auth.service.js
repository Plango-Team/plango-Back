const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const { hashValue, randomToken, signToken, hoursFromNow } = require('../utils/helpers');
const { sendOtp, verifyOtp } = require('./otp.service');
const emailService = require('./email.service');
const { config } = require('../config');

const PRIVATE_FIELDS = '+password +otp +otpExpires +otpType +emailVerificationToken +emailVerificationExpires +passwordResetToken +passwordResetExpires +emailChangeToken +emailChangeExpires +newEmail +newPhone +passwordChangedAt +isActive';

const buildUrl = (path, token) => `${config.clientUrl}/${path}?token=${token}`;

// ── Guards (shared checks used in multiple places) ────────

// Throw if account is deactivated
const checkIsActive = (user) => {
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403, 'DEACTIVATED');
  }
};

// Throw if email isn't verified yet
const checkEmailVerified = (user) => {
  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in.', 403, 'EMAIL_NOT_VERIFIED');
  }
};

// ── Per-action cooldown check ─────────────────────────────
const checkCooldown = (allowedAt, actionLabel) => {
  if (!allowedAt || allowedAt <= Date.now()) return; // no cooldown active
  const hours = Math.ceil((allowedAt - Date.now()) / (1000 * 60 * 60));
  throw new AppError(
    `You can perform ${actionLabel} again after ${hours} hour(s).`,
    429,
    'ACTION_COOLDOWN'
  );
};

// ── Auth Actions ──────────────────────────────────────────

// Register a new user
const register = async ({ name, email, password, role = 'user', phone }) => {
  // Make sure no one already has this email
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  // Create a random token, hash it, and store the hash
  // We email the raw token — only the hash lives in DB
  const rawToken = randomToken();
  const hashedToken = hashValue(rawToken);

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    provider: 'local',
    emailVerificationToken: hashedToken,
    emailVerificationExpires: hoursFromNow(24),
  });

  // Send verification link with the raw token
  const url = buildUrl('verify-email', rawToken);
  await emailService.sendVerificationEmail(user, url);

  return user.toSafeObject();
};

// Verify email from the link clicked in the inbox
const verifyEmail = async (rawToken) => {
  const hashedToken = hashValue(rawToken);

  // Find user with this token who hasn't expired yet
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification link.', 400, 'INVALID_TOKEN');
  }

  // Mark email as verified and clear the token
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user.toSafeObject();
};

// Resend a new verification email
const resendVerification = async (email) => {
  const user = await User.findOne({ email });

  // Return silently even if user not found — prevents email enumeration
  if (!user || user.isEmailVerified || user.provider !== 'local') return;

  const rawToken = randomToken();
  user.emailVerificationToken = hashValue(rawToken);
  user.emailVerificationExpires = hoursFromNow(24);
  await user.save({ validateBeforeSave: false });

  await emailService.sendVerificationEmail(user, buildUrl('verify-email', rawToken));
};

// Log in with email + password
const login = async ({ email, password }) => {
  // Fetch user with password (hidden by default)
  const user = await User.findOne({ email }).select(PRIVATE_FIELDS);

  // Always run comparePassword even if user is null — prevents timing attacks
  const passwordMatch = user ? await user.comparePassword(password) : false;

  if (!user || !passwordMatch) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  checkIsActive(user);
  checkEmailVerified(user);

  if (user.provider !== 'local') {
    throw new AppError('This account uses Google sign-in. Please continue with Google.', 400, 'WRONG_PROVIDER');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Issue a single JWT — no refresh token needed
  const token = signToken(user._id.toString(), user.role);
  return { user: user.toSafeObject(), token };
};

// Called after Google OAuth succeeds — issue a single JWT
const googleLogin = async (googleUser) => {
  checkIsActive(googleUser);

  googleUser.lastLoginAt = new Date();
  await googleUser.save({ validateBeforeSave: false });

  const token = signToken(googleUser._id.toString(), googleUser.role);
  return { user: googleUser.toSafeObject(), token };
};

// Send a password reset link via email
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // Silent success — don't reveal whether email exists
  if (!user || user.provider !== 'local') return;

  const rawToken = randomToken();
  user.passwordResetToken = hashValue(rawToken);
  user.passwordResetExpires = hoursFromNow(1);
  await user.save({ validateBeforeSave: false });

  await emailService.sendPasswordResetEmail(user, buildUrl('reset-password', rawToken));
};

// Send a password reset OTP via WhatsApp
const forgotPasswordOtp = async (phone) => {
  const user = await User.findOne({ phone, isPhoneVerified: true });

  // Silent success — don't reveal whether phone exists
  if (!user || user.provider !== 'local') return;

  await sendOtp(user, 'reset_password', phone);
};

// Reset password using the email token
const resetPasswordWithToken = async (rawToken, newPassword) => {

  checkCooldown(user.passwordChangeAllowedAt, 'password change');

  const user = await User.findOne({
    passwordResetToken: hashValue(rawToken),
    passwordResetExpires: { $gt: Date.now() },
  }).select(PRIVATE_FIELDS);

  if (!user) {
    throw new AppError('Invalid or expired reset link.', 400, 'INVALID_TOKEN');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.setPasswordCooldown(); // prevent another password change for 24h
  await user.save();

  // Notify user of the change
  emailService.sendSecurityAlertEmail(user, 'Password changed').catch(() => {});
};

// Reset password using the WhatsApp OTP
const resetPasswordWithOtp = async (phone, submittedOtp, newPassword) => {

  checkCooldown(user.passwordChangeAllowedAt, 'password change');
  const user = await User.findOne({ phone }).select(PRIVATE_FIELDS);
  if (!user) throw new AppError('No account found with this phone.', 400, 'USER_NOT_FOUND');

  await verifyOtp(user, submittedOtp, 'reset_password');

  user.password = newPassword;
  user.setPasswordCooldown(); 
  await user.save();

  emailService.sendSecurityAlertEmail(user, 'Password changed via WhatsApp').catch(() => {});
};

// Change password while logged in
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select(PRIVATE_FIELDS);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  // Only the password change action is restricted — nothing else
  checkCooldown(user.passwordChangeAllowedAt, 'password change');

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', 400, 'WRONG_PASSWORD');
  }

  user.password = newPassword;
  user.setPasswordCooldown(); // prevent another password change for 24h
  await user.save();

  emailService.sendSecurityAlertEmail(user, 'Password changed').catch(() => {});
};

// Send a verification OTP to a phone number
const sendPhoneOtp = async (userId, phone) => {
  const user = await User.findById(userId).select(PRIVATE_FIELDS);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  // Make sure no other account uses this phone
  const taken = await User.findOne({ phone, _id: { $ne: userId } });
  if (taken) throw new AppError('This phone number is already in use.', 409, 'PHONE_TAKEN');

  await sendOtp(user, 'verify_phone', phone);
};

// Verify phone OTP and mark phone as verified
const verifyPhone = async (userId, phone, submittedOtp) => {
  const user = await User.findById(userId).select(PRIVATE_FIELDS);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  await verifyOtp(user, submittedOtp, 'verify_phone');

  user.phone = phone;
  user.isPhoneVerified = true;
  await user.save({ validateBeforeSave: false });

  return user.toSafeObject();
};

// Request an email change — sends confirmation to the new email
const requestEmailChange = async (userId, newEmail, password) => {

  const user = await User.findById(userId).select(PRIVATE_FIELDS);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  if(!(await user.comparePassword(password))) {
    throw new AppError('Password is incorrect.', 400, 'WRONG_PASSWORD');
  }

  checkCooldown(user.emailChangeAllowedAt, 'email change');

  const taken = await User.findOne({ email: newEmail.toLowerCase() });
  if (taken) throw new AppError('This email is already in use.', 409, 'EMAIL_TAKEN');

  const rawToken = randomToken();
  user.emailChangeToken = hashValue(rawToken);
  user.emailChangeExpires = hoursFromNow(1);
  user.newEmail = newEmail.toLowerCase();
  await user.save({ validateBeforeSave: false });

  const url = buildUrl('confirm-email-change', rawToken);
  await emailService.sendEmailChangeEmail(newEmail, user, url);
};

// Confirm email change from the link clicked in the new inbox
const confirmEmailChange = async (rawToken) => {
  const user = await User.findOne({
    emailChangeToken: hashValue(rawToken),
    emailChangeExpires: { $gt: Date.now() },
  }).select(PRIVATE_FIELDS);

  if (!user) throw new AppError('Invalid or expired email change link.', 400, 'INVALID_TOKEN');

  const oldEmail = user.email;
  user.email = user.newEmail;
  user.newEmail = undefined;
  user.emailChangeToken = undefined;
  user.emailChangeExpires = undefined;
  user.isEmailVerified = true;
  user.setEmailCooldown(); // prevent another email change for 24h
  await user.save({ validateBeforeSave: false });

  // Alert old email address of the change
  emailService.sendSecurityAlertEmail({ ...user.toObject(), email: oldEmail }, 'Email address changed').catch(() => {});
};

// Send OTP to a new phone number to confirm the change
const requestPhoneChange = async (userId, newPhone, password) => {
  const user = await User.findById(userId).select(PRIVATE_FIELDS);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  if(!(await user.comparePassword(password))) {
    throw new AppError('Password is incorrect.', 400, 'WRONG_PASSWORD');
  }

  // Only phone changes are restricted — nothing else is affected
  checkCooldown(user.phoneChangeAllowedAt, 'phone change');

  const taken = await User.findOne({ phone: newPhone, _id: { $ne: userId } });
  if (taken) throw new AppError('This phone is already in use.', 409, 'PHONE_TAKEN');

  user.newPhone = newPhone;
  await user.save({ validateBeforeSave: false });

  await sendOtp(user, 'change_phone', newPhone);
};

// Confirm phone change by verifying the OTP sent to the new number
const confirmPhoneChange = async (userId, submittedOtp) => {
  const user = await User.findById(userId).select(PRIVATE_FIELDS);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  await verifyOtp(user, submittedOtp, 'change_phone');

  user.phone = user.newPhone;
  user.newPhone = undefined;
  user.isPhoneVerified = true;
  user.setPhoneCooldown(); // prevent another phone change for 24h
  await user.save({ validateBeforeSave: false });

  emailService.sendSecurityAlertEmail(user, 'Phone number changed').catch(() => {});
};

// Get logged-in user's profile
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  return user.toSafeObject();
};

const updateName = async (userId, newName) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  user.name = newName;
  await user.save();
  
  return user.toSafeObject();
}

const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  if (!(await user.comparePassword(password))) {
    throw new AppError('Password is incorrect.', 400, 'WRONG_PASSWORD');
  }
  
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  emailService.sendSecurityAlertEmail(user, 'Account deactivated').catch(() => {});
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  googleLogin,
  forgotPassword,
  forgotPasswordOtp,
  resetPasswordWithToken,
  resetPasswordWithOtp,
  changePassword,
  sendPhoneOtp,
  verifyPhone,
  requestEmailChange,
  confirmEmailChange,
  requestPhoneChange,
  confirmPhoneChange,
  getProfile,
  deleteAccount,
};
