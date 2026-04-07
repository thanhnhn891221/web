const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Test DB connection
    console.log('1. Testing DB connection...');
    const count = await prisma.user.count();
    console.log('   Users in DB:', count);

    if (count === 0) {
      console.log('   ❌ No users found! Database needs to be seeded.');
      console.log('   Run: npx prisma db push && npx ts-node prisma/seed.ts');
      return;
    }

    // 2. Find admin user
    console.log('\n2. Looking for admin@aio.ms...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@aio.ms' },
      include: {
        userRoles: { include: { role: true } }
      }
    });

    if (!user) {
      console.log('   ❌ User admin@aio.ms NOT FOUND');
      const allUsers = await prisma.user.findMany({ select: { email: true } });
      console.log('   Available users:', allUsers.map(u => u.email));
      return;
    }

    console.log('   ✅ Found:', user.name, '| Active:', user.isActive);
    console.log('   Roles:', user.userRoles.map(ur => ur.role.code).join(', '));
    console.log('   Password hash:', user.password.substring(0, 20) + '...');

    // 3. Test password
    console.log('\n3. Testing password "admin123"...');
    const isValid = await bcrypt.compare('admin123', user.password);
    console.log('   Password match:', isValid ? '✅ YES' : '❌ NO');

    if (!isValid) {
      // Try resetting password
      console.log('\n4. Resetting password to "admin123"...');
      const newHash = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@aio.ms' },
        data: { password: newHash }
      });
      console.log('   ✅ Password reset done!');
    }

    // 4. Check role permissions
    console.log('\n5. Checking permissions...');
    const perms = await prisma.roleModulePermission.findMany({
      where: { roleId: user.userRoles[0]?.roleId },
      include: { module: true }
    });
    console.log('   Permissions:', perms.length, 'module(s)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
