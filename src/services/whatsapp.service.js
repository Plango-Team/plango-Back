const https = require("https");
const { config } = require("../config");
const AppError = require("../utils/AppError");
const twilio = require("twilio");

// ── Twilio (plain text) ───────────────────────────────────

const sendViaTwilio = async (to, otp, type) => {
  const { accountSid, authToken, from } = config.whatsapp.twilio;

  // In development with no credentials, just log the OTP
  if (!accountSid) {
    console.log(
      `📱 [DEV - Twilio not configured] WhatsApp to ${to} (${type}): ${otp}`,
    );
    return;
  }

  // Build a human-readable message for each OTP type
  const expires = config.otpExpiresMinutes;
  const messages = {
    verify_phone: `Your phone verification code is: *${otp}*\nExpires in ${expires} minutes.`,
    reset_password: `Your password reset code is: *${otp}*\nExpires in ${expires} minutes.`,
    change_phone: `Your phone change code is: *${otp}*\nExpires in ${expires} minutes.`,
  };

  //  validation
  if (!messages[type]) {
    throw new AppError(`No message template for OTP type: ${type}`, 400);
  }
  const client = twilio(accountSid, authToken);

  //  keep same Promise flow
  try {
    return await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body: messages[type],
    });
  } catch (err) {
    console.error("Twilio Error:", err);

    throw new AppError(err?.message || "Failed to send WhatsApp message", 500);
  }
};

// ── Meta Cloud API (template messages) ───────────────────
// Example template body (what Meta shows the user):
//   "Your verification code is {{1}}. It expires in {{2}} minutes."

const sendViaMeta = (to, otp, type) => {
  const { token, phoneNumberId, languageCode, templates } =
    config.whatsapp.meta;

  // In development with no credentials, log the OTP instead
  if (!token) {
    console.log(
      `📱 [DEV - Meta not configured] WhatsApp to ${to} (${type}): ${otp}`,
    );
    return Promise.resolve();
  }

  // Look up the approved template name for this OTP type
  const templateName = templates[type];
  if (!templateName) {
    return Promise.reject(
      new Error(`No Meta template configured for OTP type: ${type}`),
    );
  }

  // Build the template message payload.
  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    to: to.replace("+", ""), // Meta expects the number without the leading +
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components: [
        {
          // "body" injects values into the {{n}} placeholders in the template body
          type: "body",
          parameters: [
            { type: "text", text: otp }, // {{1}}
            { type: "text", text: String(config.otpExpiresMinutes) }, // {{2}}
          ],
        },
        {
          // "button" with sub_type "url" adds a copy-code button (optional).
          // Only include this if your template has a URL button defined.
          // Remove this block if your template has no button.
          type: "button",
          sub_type: "url",
          index: "0", // index of the button in your template (0-based)
          parameters: [
            { type: "text", text: otp }, // fills the dynamic part of the button URL
          ],
        },
      ],
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "graph.facebook.com",
        path: `/v25.0/${phoneNumberId}/messages`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const parsed = JSON.parse(data);
          if (res.statusCode < 300) {
            resolve(parsed);
          } else {
            // Meta returns structured errors — surface the most useful part
            const errMsg =
              parsed.error?.error_user_msg ||
              parsed.error?.message ||
              "Meta WhatsApp send failed";
            reject(new Error(errMsg));
          }
        });
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
};

const sendWhatsAppOtp = (phone, otp, type) => {
  // const provider = config.whatsapp.provider;

  // if (provider === 'meta') {
  //   return sendViaMeta(phone, otp, type);
  // }

  // Default: Twilio
  return sendViaTwilio(phone, otp, type);
};

module.exports = { sendWhatsAppOtp };
