const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { config } = require('../config');

// Create one reusable mail transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// Load an HTML template file and replace {{placeholders}} with real values
const renderTemplate = (templateName, variables) => {
  const filePath = path.join(__dirname, '../templates', `${templateName}.html`);
  let html = fs.readFileSync(filePath, 'utf8');

  // Replace each {{key}} with the actual value
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value);
  });

  return html;
};

// Core send function — used by all the specific senders below
const sendEmail = async ({ to, subject, template, variables }) => {
  const html = renderTemplate(template, variables);

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
  });

  console.log(`📧 Email sent to ${to} — ${subject}`);
};

// ── Specific email senders ─────────────────────────────────

const sendVerificationEmail = (user, verificationUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Verify your email address',
    template: 'emailVerification',
    variables: { name: user.name, verificationUrl },
  });

const sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Reset your password',
    template: 'passwordReset',
    variables: { name: user.name, resetUrl },
  });

const sendEmailChangeEmail = (toEmail, user, changeUrl) =>
  sendEmail({
    to: toEmail,
    subject: 'Confirm your new email address',
    template: 'changeEmail',
    variables: { name: user.name, changeUrl, newEmail: toEmail },
  });

const sendSecurityAlertEmail = (user, action) =>
  sendEmail({
    to: user.email,
    subject: `Security alert: ${action}`,
    template: 'securityAlert',
    variables: {
      name: user.name,
      action,
      time: new Date().toUTCString(),
      lockHours: config.securityLockHours,
    },
  });

  const sendDeleteAccountEmail = (user, rawToken) =>
  sendEmail({
    to: user.email,
    subject: 'Account deletion request',
    template: 'accountDeletion',
    variables: {
      name: user.name,
      action: 'Account Deletion Requested',
      time: new Date().toUTCString(),
      graceHours: config.deletionGraceHours,
      cancelLink: `${config.clientUrl}/cancel-delete?token=${rawToken}`,
    },
  });

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeEmail,
  sendSecurityAlertEmail,
  // sendDeleteAccountEmail,
};
