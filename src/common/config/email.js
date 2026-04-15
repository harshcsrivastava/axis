import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: Number(process.env.SMTP_PORT) || 587,

    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
    });
};

const getVerificationEmailTemplate = (name, url) => {
    return `<div style="margin:0; padding:0; background-color:#061728; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:radial-gradient(circle at 15% 85%, #0f766e 0%, rgba(15, 118, 110, 0.15) 28%, transparent 54%), radial-gradient(circle at 90% 10%, #0ea5e9 0%, rgba(14, 165, 233, 0.18) 24%, transparent 50%), #061728; padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px; border:1px solid #1e3a5f; border-radius:16px; overflow:hidden; background-color:#081a2d;">
                    <tr>
                        <td style="padding:20px 24px; border-bottom:1px solid #1e3a5f; color:#93c5fd; font-size:12px; letter-spacing:1.2px; font-weight:700; text-transform:uppercase;">
                            AXIS - ChaiCode Cinema
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 24px 22px 24px; color:#e2e8f0;">
                            <h2 style="margin:0; font-size:32px; line-height:1.2; color:#f8fafc;">Welcome ${name}!</h2>
                            <p style="margin:14px 0 0 0; font-size:16px; line-height:1.65; color:#cbd5e1;">Click the button below to verify your email and activate your account.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:0 24px 26px 24px;">
                            <a href="${url}" style="display:inline-block; border-radius:10px; text-decoration:none; font-size:16px; font-weight:700; color:#062226; background-color:#2dd4bf; padding:14px 26px;">Verify Email</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 24px 24px 24px; color:#94a3b8; font-size:13px; line-height:1.6;">
                            If the button does not work, use this link:<br>
                            <a href="${url}" style="color:#67e8f9; word-break:break-all;">${url}</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    </div>`;
};

const sendVerificationEmail = async (name, email, token) => {
    const url = `${process.env.CLIENT_URL}/api/auth/verify-email/${token}`;
    await sendEmail(
        email,
        "Verify your email",
        getVerificationEmailTemplate(name, url),
    );
};

export { sendEmail, sendVerificationEmail };
