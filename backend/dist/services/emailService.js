"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendInvitationEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const SystemConfig_1 = require("../models/SystemConfig");
const database_1 = require("../config/database");
// Create reusable transporter object using dynamic configuration
const createTransporter = async () => {
    try {
        const configRepo = database_1.AppDataSource.getRepository(SystemConfig_1.SystemConfig);
        const configs = await configRepo.find({ where: { category: 'smtp' } });
        const configMap = configs.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        // Use DB config if available, otherwise fallback to env vars
        const host = configMap.smtp_host || process.env.EMAIL_HOST;
        const port = parseInt(configMap.smtp_port || process.env.EMAIL_PORT || '587');
        const user = configMap.smtp_user || process.env.EMAIL_USER;
        const pass = configMap.smtp_pass || process.env.EMAIL_PASS;
        const secure = configMap.smtp_secure === 'true' || process.env.EMAIL_SECURE === 'true';
        if (process.env.NODE_ENV !== 'production' && !host) {
            const testAccount = await nodemailer_1.default.createTestAccount();
            return nodemailer_1.default.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }
        return nodemailer_1.default.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
        });
    }
    catch (error) {
        console.error('Error creating email transporter:', error);
        // Fallback to minimal env config or error out
        return nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
};
const sendVerificationEmail = async (email, userId) => {
    console.log(`📧 Sending verification email to ${email} for user ${userId}`);
    // TODO: Implement actual verification logic if needed, for now just a placeholder or similar to invitation
    return Promise.resolve();
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendInvitationEmail = async (email, token, companyName) => {
    const transporter = await createTransporter();
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${token}`;
    const info = await transporter.sendMail({
        from: '"Auditorías en Línea" <support@auditoriasenlinea.com.ar>',
        to: email,
        subject: `Invitación a unirte a ${companyName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>¡Hola!</h2>
                <p>Has sido invitado a unirte a la organización <strong>${companyName}</strong> en Auditorías en Línea.</p>
                <p>Para aceptar la invitación y configurar tu cuenta, haz clic en el siguiente enlace:</p>
                <div style="margin: 30px 0;">
                    <a href="${inviteLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Aceptar Invitación</a>
                </div>
                <p style="color: #666; font-size: 14px;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #999; font-size: 12px;">Éste es un correo automático, por favor no respondas a esta dirección.</p>
            </div>
        `,
    });
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    if (nodemailer_1.default.getTestMessageUrl(info)) {
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
    }
};
exports.sendInvitationEmail = sendInvitationEmail;
const sendPasswordResetEmail = async (email, token) => {
    console.log(`📧 Sending password reset email to ${email}`);
    return Promise.resolve();
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
