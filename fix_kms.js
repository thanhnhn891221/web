const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Migrating CORE to KMS in Database...');
  
  // Update Module
  const coreModule = await prisma.module.findUnique({
    where: { code: 'CORE' }
  });

  if (coreModule) {
    await prisma.module.update({
      where: { code: 'CORE' },
      data: { code: 'KMS', name: 'Kernel Management System', nameVi: 'Quản trị Lõi', href: '/dashboard/kms' }
    });
    console.log('✅ Updated Module CORE -> KMS');
  } else {
    console.log('⚠️ Module CORE not found, it may have already been renamed to KMS.');
  }

  // Update Audit Logs
  const auditRes = await prisma.auditLog.updateMany({
    where: { module: 'CORE' },
    data: { module: 'KMS' }
  });
  console.log(`✅ Updated ${auditRes.count} Audit Logs from CORE to KMS`);

  console.log('Migration completed successfully!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
