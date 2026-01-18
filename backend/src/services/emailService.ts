export const sendVerificationEmail = async (email: string, userId: string) => {
    console.log(`📧 Sending verification email to ${email} for user ${userId}`);
    // In a real implementation, this would use nodemailer with SES/SendGrid/etc.
    return Promise.resolve();
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    console.log(`📧 Sending password reset email to ${email}`);
    return Promise.resolve();
};
