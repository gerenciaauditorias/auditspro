import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const createTransporter = async () => {
    // For development, use Ethereal if no env vars are set
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_HOST) {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

export const sendVerificationEmail = async (email: string, userId: string) => {
    console.log(`📧 Sending verification email to ${email} for user ${userId}`);
    // TODO: Implement actual verification logic if needed, for now just a placeholder or similar to invitation
    return Promise.resolve();
};

export const sendInvitationEmail = async (email: string, token: string, companyName: string) => {
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
    if (nodemailer.getTestMessageUrl(info)) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    console.log(`📧 Sending password reset email to ${email}`);
    return Promise.resolve();
};
