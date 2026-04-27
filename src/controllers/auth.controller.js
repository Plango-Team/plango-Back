// Controllers are the bridge between HTTP and the service layer.
// They read from req, call a service function, then send the response.
// No business logic lives here — that's all in auth.service.js.

const authService = require('../services/auth.service');
const { catchAsync, sendSuccess } = require('../utils/helpers');
const { config } = require('../config');

// ── Registration ──────────────────────────────────────────

exports.register = catchAsync(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const user = await authService.register({ name, email, password, role, phone });
  sendSuccess(res, 201, 'Account created! Please check your email to verify your account.', { user });
});

exports.verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.query.token);
  sendSuccess(res, 200, 'Email verified! You can now log in.', { user });
});

exports.resendVerification = catchAsync(async (req, res) => {
  await authService.resendVerification(req.body.email);
  // Always return success to prevent email enumeration
  sendSuccess(res, 200, 'If this email exists and is unverified, a new link has been sent.');
});

// ── Login ─────────────────────────────────────────────────

exports.login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, 200, 'Login successful.', result);
});

// ── Google OAuth ──────────────────────────────────────────

// Called after passport.authenticate succeeds — req.user is the Google user
exports.googleCallback = catchAsync(async (req, res) => {
  const result = await authService.googleLogin(req.user);

  // Set the JWT in an HTTP-only cookie so JavaScript can't access it
  res.cookie('token', result.token, {
    httpOnly: true,                          
    secure: config.isProd,                   
    sameSite: config.isProd ? 'strict' : 'lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days in milliseconds
  });

  // Redirect to the client — the cookie travels with the browser automatically
  res.redirect(`${config.clientUrl}/auth/callback`);
});

// ── Password Reset ────────────────────────────────────────

exports.forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, 200, 'If an account with that email exists, a reset link has been sent.');
});

exports.forgotPasswordOtp = catchAsync(async (req, res) => {
  await authService.forgotPasswordOtp(req.body.phone);
  sendSuccess(res, 200, 'If an account with that phone exists, an OTP has been sent via WhatsApp.');
});

exports.resetPasswordWithToken = catchAsync(async (req, res) => {
  await authService.resetPasswordWithToken(req.body.token, req.body.newPassword);
  sendSuccess(res, 200, 'Password reset! Please log in with your new password.');
});

exports.resetPasswordWithOtp = catchAsync(async (req, res) => {
  await authService.resetPasswordWithOtp(req.body.phone, req.body.otp, req.body.newPassword);
  sendSuccess(res, 200, 'Password reset! Please log in with your new password.');
});

// ── Authenticated Actions ─────────────────────────────────

exports.getMe = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  sendSuccess(res, 200, 'Profile retrieved.', { user });
});

exports.changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, 200, 'Password changed. Your account is locked for 24h for security. Please log in again.');
});

// ── Phone Verification ────────────────────────────────────

exports.sendPhoneOtp = catchAsync(async (req, res) => {
  await authService.sendPhoneOtp(req.user._id, req.body.phone);
  sendSuccess(res, 200, 'OTP sent to your phone via WhatsApp.');
});

exports.verifyPhone = catchAsync(async (req, res) => {
  const user = await authService.verifyPhone(req.user._id, req.body.phone, req.body.otp);
  sendSuccess(res, 200, 'Phone number verified!', { user });
});

// ── Email Change ──────────────────────────────────────────

exports.requestEmailChange = catchAsync(async (req, res) => {
  await authService.requestEmailChange(req.user._id, req.body.newEmail , req.body.password);
  sendSuccess(res, 200, 'A confirmation link has been sent to your new email address.');
});

exports.confirmEmailChange = catchAsync(async (req, res) => {
  await authService.confirmEmailChange(req.body.token);
  sendSuccess(res, 200, 'Email changed! Your account is locked for 24h for security. Please log in again.');
});

// ── Phone Change ──────────────────────────────────────────

exports.requestPhoneChange = catchAsync(async (req, res) => {
  await authService.requestPhoneChange(req.user._id, req.body.newPhone , req.body.password);
  sendSuccess(res, 200, 'An OTP has been sent to your new phone number via WhatsApp.');
});

exports.confirmPhoneChange = catchAsync(async (req, res) => {
  await authService.confirmPhoneChange(req.user._id, req.body.otp);
  sendSuccess(res, 200, 'Phone number updated! Your account is locked for 24h for security.');
});

exports.updateName = catchAsync(async (req, res) => {
  const user = await authService.updateName(req.user._id, req.body.name);
  sendSuccess(res, 200, 'Name updated successfully.', { user });
});

exports.deleteAccount = catchAsync(async (req, res) => {
  await authService.deleteAccount(req.user._id, req.body.password);
  sendSuccess(res, 200, 'Account deleted. We\'re sorry to see you go!');
});
