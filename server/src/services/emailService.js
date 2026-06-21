const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
    constructor() {
        this.transporter = null;
        this.initPromise = null;
    }

    async getTransporter() {
    if (this.transporter) {
        return this.transporter;
    }

    if (this.initPromise) {
        return this.initPromise;
    }

    this.initPromise = (async () => {
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        logger.info("SMTP CONFIG", {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: user ? "SET" : "NOT SET"
        });

        if (!user || !pass) {
            logger.error("SMTP credentials missing");
            return null;
        }

        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user,
                pass
            },
            requireTLS: true,
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000,
            debug: true,
            logger: true
        });

        try {
            await this.transporter.verify();
            logger.info("✅ SMTP connection verified");
        } catch (error) {
            logger.error("❌ SMTP verification failed", error);

            this.transporter = null;
            this.initPromise = null;

            throw error;
        }

        return this.transporter;
    })();

    return this.initPromise;
}

    /**
     * Lazily resolve SMTP host to IPv4 and create Nodemailer transporter.
     * Recreates transporter if previous sending attempts failed.
     */
    // async getTransporter() {
    //     if (this.transporter) {
    //         return this.transporter;
    //     }
    //     if (this.initPromise) {
    //         return this.initPromise;
    //     }

    //     this.initPromise = (async () => {
    //         const host = process.env.SMTP_HOST;
    //         const port = process.env.SMTP_PORT;
    //         const user = process.env.SMTP_USER;
    //         const pass = process.env.SMTP_PASS;

    //         if (!user || !pass) {
    //             logger.warn("⚠️ SMTP credentials not fully configured in .env. Deleted booking audits will be logged instead of emailed.");
    //             return null;
    //         }

    //         if (host) {
    //             let resolvedHost = host;
    //             let tlsOptions = {};

    //             const net = require("net");
    //             // Skip DNS resolution if host is already an IP address
    //             if (!net.isIP(host)) {
    //                 try {
    //                     const dns = require("dns").promises;
    //                     // Force resolution to IPv4 address using dns.lookup to bypass Render's lack of outbound IPv6 routing.
    //                     // dns.lookup is preferred over dns.resolve4 as it respects OS-level hosts/resolver settings.
    //                     const lookup = await dns.lookup(host, { family: 4 });
    //                     if (lookup && lookup.address) {
    //                         resolvedHost = lookup.address;
    //                         tlsOptions = { servername: host }; // Necessary for SNI and TLS certificate verification
    //                         logger.info(`🌐 DNS Resolution: Resolved SMTP host ${host} to IPv4 address ${resolvedHost}`);
    //                     }
    //                 } catch (dnsErr) {
    //                     logger.error(`⚠️ DNS Resolution failure for ${host}: ${dnsErr.message}. Falling back to hostname.`);
    //                 }
    //             }

    //             logger.info(`⚙️ Configuring Nodemailer transporter with Host: ${resolvedHost}, Port: ${port}, Secure: ${port === "465"}`);
    //             this.transporter = nodemailer.createTransport({
    //                 host: resolvedHost,
    //                 port: parseInt(port, 10) || 587,
    //                 secure: Number(port) === 465,
    //                 auth: { user, pass },
    //                 connectionTimeout: 20000, // 20 seconds fail-fast
    //                 greetingTimeout: 20000,
    //                 socketTimeout: 20000,
    //                 debug: true,
    //                 logger: true,
    //                 tls: {
    //                     rejectUnauthorized: true,
    //                     ...tlsOptions
    //                 }
    //             });
    //         } else {
    //             logger.info("⚙️ Configuring Nodemailer transporter with Gmail service preset.");
    //             this.transporter = nodemailer.createTransport({
    //                 service: "gmail",
    //                 auth: { user, pass },
    //                 connectionTimeout: 20000,
    //                 greetingTimeout: 20000,
    //                 socketTimeout: 20000
    //             });
    //         }

    //         return this.transporter;
    //     })();

    //     return this.initPromise;
    // }

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

        const transporter = await this.getTransporter();

        if (transporter) {
            try {
                await transporter.sendMail(mailOptions);
                logger.info(`📧 Deleted booking audit email sent to ${recipient}`);
            } catch (error) {
                logger.error(`❌ Failed to send deletion email to ${recipient}. Error: ${error.message}`, { error });
                // Reset cached transporter and initPromise so next call performs fresh DNS resolution
                this.transporter = null;
                this.initPromise = null;
                throw error;
            }
        } else {
            logger.info(`📢 [Email Simulation] Deletion audit payload for ${recipient}:\n` + JSON.stringify(bookingData, null, 2));
        }
    }
}

module.exports = new EmailService();
