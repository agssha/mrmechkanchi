const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (user && pass) {
            if (host) {
                this.transporter = nodemailer.createTransport({
                    host: host,
                    port: parseInt(port, 10) || 587,
                    secure: port === "465",
                    auth: { user, pass }
                });
            } else {
                this.transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: { user, pass }
                });
            }
        } else {
            logger.warn("⚠️ SMTP credentials not fully configured in .env. Deleted booking audits will be logged instead of emailed.");
            this.transporter = null;
        }
    }

    async sendDeletedBookingEmail(bookingData) {
        const recipient = "mr.mechkanchi@gmail.com";
        const subject = `🚨 Audit Alert: Booking Deleted - ID: ${bookingData._id}`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                <h2 style="color: #e53e3e; border-bottom: 2px solid #e53e3e; padding-bottom: 10px;">Deleted Booking Audit Notification</h2>
                <p>The following repair booking has been permanently deleted from the Mr. Mech Kanchi system.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr style="background-color: #f7fafc;">
                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Field</th>
                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Details</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Booking ID</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${bookingData._id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Customer Name</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${bookingData.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Mobile Number</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${bookingData.mobileNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${bookingData.userEmail || "N/A"}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Service Type</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${bookingData.serviceType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Service Address</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${bookingData.serviceAddress}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Problem Description</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${bookingData.problemDescription || "N/A"}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Estimated Price</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">₹${bookingData.estimatedPrice || 0}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Status</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">${bookingData.status}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Assigned Mechanic</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${bookingData.mechanicName || "Unassigned"}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Deleted Timestamp</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${new Date().toLocaleString()}</td>
                    </tr>
                </table>
                <div style="margin-top: 20px; font-size: 11px; color: #a0aec0; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                    This is an automated administrative audit email from the Mr. Mech Kanchi Platform.
                </div>
            </div>
        `;

        const mailOptions = {
            from: process.env.SMTP_USER || "mr.mechkanchi.alert@gmail.com",
            to: recipient,
            subject: subject,
            html: html
        };

        if (this.transporter) {
            try {
                await this.transporter.sendMail(mailOptions);
                logger.info(`📧 Deleted booking audit email sent to ${recipient}`);
            } catch (error) {
                logger.error(`❌ Failed to send deletion email: ${error.message}`);
            }
        } else {
            logger.info(`📢 [Email Simulation] Deletion audit payload for ${recipient}:\n` + JSON.stringify(bookingData, null, 2));
        }
    }
}

module.exports = new EmailService();
