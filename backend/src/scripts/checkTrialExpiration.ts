import { AppDataSource } from '../config/database';
import { Tenant } from '../models/Tenant';
import { LessThanOrEqual } from 'typeorm';

async function checkTrialExpirations() {
    try {
        console.log('Initializing Data Source...');
        await AppDataSource.initialize();
        console.log('Data Source initialized.');

        const tenantRepo = AppDataSource.getRepository(Tenant);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30); // Use for warning logic if needed

        // 1. Find Trials that HAVE ended today or before (and are still marked active)
        const expiredTrials = await tenantRepo.find({
            where: {
                subscriptionStatus: 'trial_active',
                trialEndsAt: LessThanOrEqual(now)
            }
        });

        console.log(`Found ${expiredTrials.length} expired trials.`);

        for (const tenant of expiredTrials) {
            console.log(`Processing tenant: ${tenant.companyName} (${tenant.id})`);

            // Update status
            tenant.subscriptionStatus = 'trial_ending';
            await tenantRepo.save(tenant);

            // TODO: Send Email Notification
            // await emailService.sendTrialEndingEmail(tenant.adminEmail);
            console.log(`Updated status to 'trial_ending' for ${tenant.companyName}`);
        }

        console.log('Trial expiration check completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error checking trial expirations:', error);
        process.exit(1);
    }
}

checkTrialExpirations();
