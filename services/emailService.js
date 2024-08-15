const nodemailer = require('nodemailer');

// Function to create a transporter with given email provider credentials
const createTransporter = ({ host, port, secure, service, user, pass }) => {
  return nodemailer.createTransport({
    host: host || undefined, // Custom SMTP server
    port: port || undefined, // Port for SMTP
    secure: secure || false, // Whether the connection should use SSL/TLS
    service: service || undefined, // Predefined service like Gmail, Outlook, etc.
    auth: {
      user: user,
      pass: pass,
    },
  });
};

// Function to send the password reset email
const sendResetEmail = (email, token, transporterOptions) => {
  const transporter = createTransporter(transporterOptions);
  
  const mailOptions = {
    from: transporterOptions.user,
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Use this token: ${token}`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendResetEmail;





















































































































