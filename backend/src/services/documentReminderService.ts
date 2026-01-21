import cron from 'node-cron';
import { AppDataSource } from '../config/database';
import { Document } from '../models/Document';
import { LessThan, MoreThan, IsNull, Not } from 'typeorm';

// Service to check for documents needing review
export class DocumentReminderService {

    // Run daily at 9 AM
    static startScheduledJobs() {
        // Check for documents expiring in 30 days
        cron.schedule('0 9 * * *', async () => {
            console.log('Running document review reminder check...');
            await this.checkExpiringDocuments(30);
        });

        // Check for documents expiring in 7 days
        cron.schedule('0 9 * * *', async () => {
            console.log('Running urgent document review check...');
            await this.checkExpiringDocuments(7);
        });

        // Check for expired documents
        cron.schedule('0 9 * * *', async () => {
            console.log('Running expired document check...');
            await this.markExpiredDocuments();
        });

        console.log('Document reminder jobs scheduled');
    }

    static async checkExpiringDocuments(daysUntilExpiry: number) {
        const documentRepo = AppDataSource.getRepository(Document);

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysUntilExpiry);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find documents expiring in exactly N days
        const expiringDocs = await documentRepo.find({
            where: {
                nextReviewDate: MoreThan(targetDate) && LessThan(nextDay),
                status: 'approved'
            },
            relations: ['responsibleUser', 'tenant']
        });

        console.log(`Found ${expiringDocs.length} documents expiring in ${daysUntilExpiry} days`);

        // Send notifications (implement email service)
        for (const doc of expiringDocs) {
            await this.sendReminderNotification(doc, daysUntilExpiry);
        }
    }

    static async markExpiredDocuments() {
        const documentRepo = AppDataSource.getRepository(Document);

        const now = new Date();

        // Find documents past their review date
        const expiredDocs = await documentRepo.find({
            where: {
                nextReviewDate: LessThan(now),
                status: 'approved'
            }
        });

        console.log(`Found ${expiredDocs.length} expired documents`);

        // Update status to indicate expiration
        for (const doc of expiredDocs) {
            // You could add an 'expired' status or flag
            // For now, we'll just log it
            console.log(`Document ${doc.code} (${doc.fileName}) is past review date`);

            // Optional: Update a flag
            // doc.isExpired = true;
            // await documentRepo.save(doc);
        }
    }

    static async sendReminderNotification(document: Document, daysUntilExpiry: number) {
        // TODO: Implement email notification service
        // For now, just log
        console.log(`
            REMINDER: Document Review Needed
            Document: ${document.fileName} (${document.code})
            Responsible: ${document.responsibleUser?.fullName || 'N/A'}
            Days until expiry: ${daysUntilExpiry}
            Review date: ${document.nextReviewDate}
        `);

        // Example email structure:
        /*
        const emailData = {
            to: document.responsibleUser?.email,
            subject: `Reminder: Document "${document.fileName}" needs review`,
            body: `
                Hello ${document.responsibleUser?.fullName},
                
                This is a reminder that the following document requires review:
                
                Document: ${document.fileName}
                Code: ${document.code}
                Review Date: ${document.nextReviewDate}
                Days Remaining: ${daysUntilExpiry}
                
                Please review and update the document as needed.
                
                Best regards,
                Auditorías en Línea
            `
        };
        
        await emailService.send(emailData);
        */
    }

    // Manual trigger for testing
    static async checkAllDocuments() {
        await this.checkExpiringDocuments(30);
        await this.checkExpiringDocuments(7);
        await this.markExpiredDocuments();
    }
}
