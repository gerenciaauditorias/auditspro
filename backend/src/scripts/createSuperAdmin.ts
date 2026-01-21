import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';

async function createSuperAdmin() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        const tenantRepo = AppDataSource.getRepository(Tenant);
        const userRepo = AppDataSource.getRepository(User);

        // Create system tenant
        let systemTenant = await tenantRepo.findOne({ where: { subdomain: 'system' } });

        if (!systemTenant) {
            systemTenant = tenantRepo.create({
                companyName: 'System Administration',
                subdomain: 'system',
                planType: 'enterprise',
                status: 'active',
                onboardingCompleted: true
            });
            await tenantRepo.save(systemTenant);
            console.log('✅ System tenant created');
        } else {
            console.log('ℹ️  System tenant already exists');
        }

        // Check if super admin exists
        let superAdmin = await userRepo.findOne({
            where: { email: 'sysadmin@auditoriasenlinea.com.ar' }
        });

        const passwordHash = await bcrypt.hash('syst2m1dm3n', 10);

        if (!superAdmin) {
            superAdmin = userRepo.create({
                email: 'sysadmin@auditoriasenlinea.com.ar',
                passwordHash,
                fullName: 'System Administrator',
                role: 'super_admin',
                tenantId: systemTenant.id,
                isActive: true,
                emailVerified: true
            });
            await userRepo.save(superAdmin);
            console.log('✅ Super admin user created');
            console.log('   Email: sysadmin@auditoriasenlinea.com.ar');
            console.log('   Password: syst2m1dm3n');
        } else {
            // Update existing super admin
            superAdmin.passwordHash = passwordHash;
            superAdmin.role = 'super_admin';
            superAdmin.isActive = true;
            await userRepo.save(superAdmin);
            console.log('✅ Super admin user updated');
        }

        await AppDataSource.destroy();
        console.log('✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createSuperAdmin();
