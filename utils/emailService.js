/**
 * Email Service
 * Handles sending transactional emails using Nodemailer
 */

const nodemailer = require("nodemailer");

// Create transporter - using Gmail by default, can be configured for other providers
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send contact form confirmation email to customer
 * @param {Object} params - Email parameters
 * @param {string} params.name - Customer name
 * @param {string} params.email - Customer email
 * @param {string} params.subject - Contact subject
 */
exports.sendContactConfirmation = async ({ name, email, subject }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email service not configured - skipping confirmation email");
    return { messageId: null };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Thank you for contacting Serenity Spa - ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6B5B95;">Serenity Spa</h1>
        <h2>Thank you for contacting us, ${name}!</h2>
        <p>We've received your message and our team will get back to you shortly.</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>We typically respond within 24 business hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">
          Serenity Spa - Your Sanctuary for Relaxation and Wellness
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending confirmation email:", error.message);
    throw error;
  }
};

/**
 * Send admin notification about new contact
 * @param {string} type - Notification type (contact, booking, etc.)
 * @param {Object} data - Data to include in notification
 */
exports.sendAdminNotification = async (type, data) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email service not configured - skipping admin notification");
    return { messageId: null };
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  let subject, html;

  if (type === "contact") {
    subject = `New Contact Message from ${data.name}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6B5B95;">Serenity Spa - New Contact</h1>
        <h3>You have a new contact form submission:</h3>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${data.message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">
          Sent from Serenity Spa Contact Form
        </p>
      </div>
    `;
  } else if (type === "booking") {
    subject = `New Booking Request from ${data.name}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6B5B95;">Serenity Spa - New Booking</h1>
        <h3>You have a new booking request:</h3>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Notes:</strong> ${data.notes || "None"}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">
          Sent from Serenity Spa Booking Form
        </p>
      </div>
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: subject,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Admin notification sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending admin notification:", error.message);
    throw error;
  }
};

/**
 * Send booking confirmation email to customer
 * @param {Object} params - Booking details
 */
exports.sendBookingConfirmation = async ({ name, email, service, date, time }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email service not configured - skipping booking confirmation");
    return { messageId: null };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Booking Confirmed - Serenity Spa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6B5B95;">Serenity Spa</h1>
        <h2>Booking Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled appointment.</p>
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">
          Serenity Spa - Your Sanctuary for Relaxation and Wellness
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending booking confirmation:", error.message);
    throw error;
  }
};
