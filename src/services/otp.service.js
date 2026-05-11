const AppError = require('../utils/AppError');
const { generateOtp, hashValue, minutesFromNow } = require('../utils/helpers');
const { sendWhatsAppOtp } = require('./whatsapp.service');
const { config } = require('../config');
const { t } = require('../utils/i18n');

// Generate a 6-digit OTP, save it (hashed) to the user, and send via WhatsApp
const sendOtp = async (user, type, phone, lang) => {
  const rawOtp = generateOtp();         // plain OTP shown to user
  const hashedOtp = hashValue(rawOtp);  // hashed version stored in DB

  // Save hashed OTP and its type/expiry to user document
  user.otp = hashedOtp;
  user.otpExpires = minutesFromNow(config.otpExpiresMinutes);
  user.otpType = type;
  await user.save({ validateBeforeSave: false });

  // Send plain OTP to user's phone via WhatsApp
  try {
    await sendWhatsAppOtp(phone, rawOtp, type , lang);
  } catch (err) {
    console.error(`WhatsApp send failed: ${err.message}`);
    // ignore only for forgot password
    if (type === 'reset_password') return;

    // otherwise throw
    throw new AppError(t(lang, 'OTP_SEND_FAILED'), 500);
  }

  // In development, print OTP to console so you can test without WhatsApp
  if (config.nodeEnv !== 'production') {
    console.log(`\n🔑 [DEV OTP] ${phone} (${type}): ${rawOtp}\n`);
  }
};

// Verify an OTP submitted by the user
const verifyOtp = async (user, submittedOtp, expectedType ,lang = 'ar') => {
  // Make sure OTP fields are present
  if (!user.otp || !user.otpExpires || !user.otpType) {
    throw new AppError(t(lang, 'OTP_NOT_FOUND'), 400, 'OTP_NOT_FOUND');
  }

  // Make sure the OTP is for the right action
  if (user.otpType !== expectedType) {
    throw new AppError(t(lang, 'OTP_TYPE_MISMATCH'), 400, 'OTP_TYPE_MISMATCH');
  }

  // Make sure it hasn't expired
  if (user.otpExpires < Date.now()) {
    user.clearOtp();
    await user.save({ validateBeforeSave: false });
    throw new AppError(t(lang, 'OTP_EXPIRED'), 400, 'OTP_EXPIRED');
  }

  // Hash what the user submitted and compare with what's stored
  if (hashValue(submittedOtp) !== user.otp) {
    throw new AppError(t(lang, 'OTP_INVALID'), 400, 'OTP_INVALID');
  }

  // ✅ OTP is valid — clear it so it can't be used again (one-time use)
  user.clearOtp();
  await user.save({ validateBeforeSave: false });
};

module.exports = { sendOtp, verifyOtp };
