// All user-facing strings in one place.
// Add a new key to BOTH languages every time you add a message.
// Supports simple variable interpolation: "Hello {{name}}" → t(lang, 'key', { name: 'Ali' })

const locales = {
  en: {
    // ── Register ────────────────────────────────────────────
    REGISTER_SUCCESS:           'Account created! Please check your email to verify your account.',
    EMAIL_TAKEN:                'An account with this email already exists.',

    // ── Email Verification ───────────────────────────────────
    EMAIL_VERIFIED:             'Email verified! You can now log in.',
    VERIFY_EMAIL_INVALID:       'Invalid or expired verification link.',
    RESEND_VERIFICATION:        'If this email exists and is unverified, a new link has been sent.',

    // ── Login ────────────────────────────────────────────────
    LOGIN_SUCCESS:              'Login successful.',
    INVALID_CREDENTIALS:        'Invalid email or password.',
    EMAIL_NOT_VERIFIED:         'Please verify your email before logging in.',
    WRONG_PROVIDER:             'This account uses Google sign-in. Please continue with Google.',
    DEACTIVATED:                'Your account has been deactivated. Contact support.',

    // ── Token ────────────────────────────────────────────────
    NO_TOKEN:                   'Please log in to access this.',
    INVALID_TOKEN:              'Invalid or expired token. Please log in again.',
    USER_NOT_FOUND:             'User not found or account deactivated.',
    PASSWORD_CHANGED_RELOGIN:   'Password was changed. Please log in again.',

    // ── Password Reset ───────────────────────────────────────
    FORGOT_PASSWORD_EMAIL:      'If an account with that email exists, a reset link has been sent.',
    FORGOT_PASSWORD_OTP:        'If an account with that phone exists, an OTP has been sent via WhatsApp.',
    RESET_PASSWORD_SUCCESS:     'Password reset! Please log in with your new password.',
    RESET_TOKEN_INVALID:        'Invalid or expired reset link.',
    NO_ACCOUNT_PHONE:           'No account found with this phone.',

    // ── Change Password ──────────────────────────────────────
    CHANGE_PASSWORD_SUCCESS:    'Password changed. You can log in again after the cooldown period.',
    WRONG_PASSWORD:             'Current password is incorrect.',

    // ── OTP ──────────────────────────────────────────────────
    OTP_SENT:                   'OTP sent to your phone via WhatsApp.',
    OTP_NOT_FOUND:              'No OTP found. Please request a new one.',
    OTP_TYPE_MISMATCH:          'Invalid OTP type.',
    OTP_EXPIRED:                'OTP has expired. Please request a new one.',
    OTP_INVALID:                'Incorrect OTP. Please try again.',

    // ── Phone Verification ───────────────────────────────────
    PHONE_VERIFIED:             'Phone number verified!',
    PHONE_TAKEN:                'This phone number is already in use.',

    // ── Email Change ─────────────────────────────────────────
    EMAIL_CHANGE_REQUESTED:     'A confirmation link has been sent to your new email address.',
    EMAIL_CHANGE_SUCCESS:       'Email changed! Please log in again with your new email.',
    EMAIL_CHANGE_INVALID:       'Invalid or expired email change link.',

    // ── Phone Change ──────────────────────────────────────────
    PHONE_CHANGE_REQUESTED:     'An OTP has been sent to your new phone number via WhatsApp.',
    PHONE_CHANGE_SUCCESS:       'Phone number updated!',

    // ── Profile ───────────────────────────────────────────────
    PROFILE_RETRIEVED:          'Profile retrieved.',
    NOT_FOUND:                  'User not found.',

    // ── Cooldown ──────────────────────────────────────────────
    // {{hours}} is replaced at runtime
    ACTION_COOLDOWN:            'You can perform this action again after {{hours}} hour(s).',

    // ── Rate Limiting ─────────────────────────────────────────
    // {{time}} is replaced at runtime
    TOO_MANY_REQUESTS:          'Too many requests. Try again after {{time}}.',

    // ── RBAC ──────────────────────────────────────────────────
    // {{roles}} is replaced at runtime
    INSUFFICIENT_ROLE:          'Access denied. Required role: {{roles}}.',

    // ── Validation ────────────────────────────────────────────
    VALIDATION_FAILED:          'Validation failed.',

    // ── WhatsApp OTP message bodies ───────────────────────────
    // {{otp}} and {{expires}} are replaced at runtime
    OTP_MSG_VERIFY_PHONE:       'Your phone verification code is: *{{otp}}*\nExpires in {{expires}} minutes.',
    OTP_MSG_RESET_PASSWORD:     'Your password reset code is: *{{otp}}*\nExpires in {{expires}} minutes.',
    OTP_MSG_CHANGE_PHONE:       'Your phone change code is: *{{otp}}*\nExpires in {{expires}} minutes.',

    // ── Email subjects ────────────────────────────────────────
    EMAIL_SUBJECT_VERIFY:       'Verify your email address',
    EMAIL_SUBJECT_RESET:        'Reset your password',
    EMAIL_SUBJECT_CHANGE_EMAIL: 'Confirm your new email address',
    EMAIL_SUBJECT_SECURITY:     'Security alert: {{action}}',
  },

  ar: {
    // ── Register ────────────────────────────────────────────
    REGISTER_SUCCESS:           'تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك.',
    EMAIL_TAKEN:                'يوجد حساب مرتبط بهذا البريد الإلكتروني بالفعل.',

    // ── Email Verification ───────────────────────────────────
    EMAIL_VERIFIED:             'تم التحقق من البريد الإلكتروني! يمكنك تسجيل الدخول الآن.',
    VERIFY_EMAIL_INVALID:       'رابط التحقق غير صالح أو منتهي الصلاحية.',
    RESEND_VERIFICATION:        'إذا كان البريد الإلكتروني موجوداً وغير مفعّل، سيتم إرسال رابط جديد.',

    // ── Login ────────────────────────────────────────────────
    LOGIN_SUCCESS:              'تم تسجيل الدخول بنجاح.',
    INVALID_CREDENTIALS:        'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    EMAIL_NOT_VERIFIED:         'يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول.',
    WRONG_PROVIDER:             'هذا الحساب مرتبط بتسجيل الدخول عبر Google. يرجى المتابعة مع Google.',
    DEACTIVATED:                'تم تعطيل حسابك. يرجى التواصل مع الدعم الفني.',

    // ── Token ────────────────────────────────────────────────
    NO_TOKEN:                   'يرجى تسجيل الدخول للوصول إلى هذه الصفحة.',
    INVALID_TOKEN:              'الرمز غير صالح أو منتهي الصلاحية. يرجى تسجيل الدخول مجدداً.',
    USER_NOT_FOUND:             'المستخدم غير موجود أو تم تعطيل الحساب.',
    PASSWORD_CHANGED_RELOGIN:   'تم تغيير كلمة المرور. يرجى تسجيل الدخول مجدداً.',

    // ── Password Reset ───────────────────────────────────────
    FORGOT_PASSWORD_EMAIL:      'إذا كان الحساب موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور.',
    FORGOT_PASSWORD_OTP:        'إذا كان الحساب موجوداً، سيتم إرسال رمز التحقق عبر واتساب.',
    RESET_PASSWORD_SUCCESS:     'تم إعادة تعيين كلمة المرور! يرجى تسجيل الدخول بكلمة المرور الجديدة.',
    RESET_TOKEN_INVALID:        'رابط إعادة التعيين غير صالح أو منتهي الصلاحية.',
    NO_ACCOUNT_PHONE:           'لا يوجد حساب مرتبط بهذا الرقم.',

    // ── Change Password ──────────────────────────────────────
    CHANGE_PASSWORD_SUCCESS:    'تم تغيير كلمة المرور. يمكنك تسجيل الدخول مجدداً بعد انتهاء فترة الانتظار.',
    WRONG_PASSWORD:             'كلمة المرور الحالية غير صحيحة.',

    // ── OTP ──────────────────────────────────────────────────
    OTP_SENT:                   'تم إرسال رمز التحقق إلى هاتفك عبر واتساب.',
    OTP_NOT_FOUND:              'لا يوجد رمز تحقق. يرجى طلب رمز جديد.',
    OTP_TYPE_MISMATCH:          'نوع رمز التحقق غير صالح.',
    OTP_EXPIRED:                'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.',
    OTP_INVALID:                'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.',

    // ── Phone Verification ───────────────────────────────────
    PHONE_VERIFIED:             'تم التحقق من رقم الهاتف!',
    PHONE_TAKEN:                'رقم الهاتف مستخدم بالفعل.',

    // ── Email Change ─────────────────────────────────────────
    EMAIL_CHANGE_REQUESTED:     'تم إرسال رابط التأكيد إلى بريدك الإلكتروني الجديد.',
    EMAIL_CHANGE_SUCCESS:       'تم تغيير البريد الإلكتروني! يرجى تسجيل الدخول بالبريد الجديد.',
    EMAIL_CHANGE_INVALID:       'رابط تغيير البريد الإلكتروني غير صالح أو منتهي الصلاحية.',

    // ── Phone Change ──────────────────────────────────────────
    PHONE_CHANGE_REQUESTED:     'تم إرسال رمز التحقق إلى رقم هاتفك الجديد عبر واتساب.',
    PHONE_CHANGE_SUCCESS:       'تم تحديث رقم الهاتف!',

    // ── Profile ───────────────────────────────────────────────
    PROFILE_RETRIEVED:          'تم استرجاع الملف الشخصي.',
    NOT_FOUND:                  'المستخدم غير موجود.',

    // ── Cooldown ──────────────────────────────────────────────
    ACTION_COOLDOWN:            'يمكنك تنفيذ هذا الإجراء مجدداً بعد {{hours}} ساعة.',

    // ── Rate Limiting ─────────────────────────────────────────
    TOO_MANY_REQUESTS:          'طلبات كثيرة جداً. حاول مجدداً بعد {{time}}.',

    // ── RBAC ──────────────────────────────────────────────────
    INSUFFICIENT_ROLE:          'غير مصرح لك بالوصول. الصلاحية المطلوبة: {{roles}}.',

    // ── Validation ────────────────────────────────────────────
    VALIDATION_FAILED:          'فشل التحقق من صحة البيانات.',

    // ── WhatsApp OTP message bodies ───────────────────────────
    OTP_MSG_VERIFY_PHONE:       'رمز التحقق من هاتفك هو: *{{otp}}*\nينتهي خلال {{expires}} دقيقة.',
    OTP_MSG_RESET_PASSWORD:     'رمز إعادة تعيين كلمة المرور هو: *{{otp}}*\nينتهي خلال {{expires}} دقيقة.',
    OTP_MSG_CHANGE_PHONE:       'رمز تغيير رقم هاتفك هو: *{{otp}}*\nينتهي خلال {{expires}} دقيقة.',

    // ── Email subjects ────────────────────────────────────────
    EMAIL_SUBJECT_VERIFY:       'تحقق من بريدك الإلكتروني',
    EMAIL_SUBJECT_RESET:        'إعادة تعيين كلمة المرور',
    EMAIL_SUBJECT_CHANGE_EMAIL: 'تأكيد بريدك الإلكتروني الجديد',
    EMAIL_SUBJECT_SECURITY:     'تنبيه أمني: {{action}}',
  },
};

module.exports = locales;
