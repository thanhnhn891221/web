// AIO.MS — Database Seed
// Khởi tạo dữ liệu ban đầu cho hệ thống

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo dữ liệu AIO.MS...\n');

  // ━━━ 1. TẠO MODULES (16 phân hệ) ━━━
  console.log('📦 Tạo 16 Modules...');
  const modulesData = [
    { code: 'CORE', name: 'Admin & Core', nameVi: 'Quản trị Hệ thống', groupCode: 'foundation', icon: 'Shield', color: 'hsl(217, 72%, 46%)', href: '/dashboard', orderIndex: 0 },
    { code: 'IMS', name: 'IT Management', nameVi: 'Quản lý CNTT', groupCode: 'foundation', icon: 'Server', color: 'hsl(250, 60%, 52%)', href: '/dashboard/ims', orderIndex: 1 },
    { code: 'HMS', name: 'Human Resources', nameVi: 'Quản lý Nhân sự', groupCode: 'foundation', icon: 'Users', color: 'hsl(174, 65%, 40%)', href: '/dashboard/hms', orderIndex: 2 },
    { code: 'PMS', name: 'Procurement', nameVi: 'Quản lý Mua hàng', groupCode: 'operations', icon: 'ShoppingCart', color: 'hsl(262, 70%, 55%)', href: '/dashboard/pms', orderIndex: 3 },
    { code: 'WMS', name: 'Warehouse', nameVi: 'Quản lý Kho bãi', groupCode: 'operations', icon: 'Warehouse', color: 'hsl(200, 70%, 45%)', href: '/dashboard/wms', orderIndex: 4 },
    { code: 'TMS', name: 'Transport', nameVi: 'Quản lý Giao hàng', groupCode: 'operations', icon: 'Truck', color: 'hsl(30, 80%, 50%)', href: '/dashboard/tms', orderIndex: 5 },
    { code: 'FMS', name: 'Factory', nameVi: 'Quản lý Nhà máy', groupCode: 'market', icon: 'Factory', color: 'hsl(340, 65%, 50%)', href: '/dashboard/fms', orderIndex: 6 },
    { code: 'QMS', name: 'Quality', nameVi: 'Quản lý Chất lượng', groupCode: 'market', icon: 'CheckCircle', color: 'hsl(142, 60%, 42%)', href: '/dashboard/qms', orderIndex: 7 },
    { code: 'RMS', name: 'R&D', nameVi: 'Nghiên cứu & Phát triển', groupCode: 'market', icon: 'Lightbulb', color: 'hsl(45, 85%, 50%)', href: '/dashboard/rms', orderIndex: 8 },
    { code: 'MMS', name: 'Marketing', nameVi: 'Quản lý Marketing', groupCode: 'market', icon: 'Megaphone', color: 'hsl(280, 65%, 55%)', href: '/dashboard/mms', orderIndex: 9 },
    { code: 'SMS', name: 'Sales', nameVi: 'Quản lý Bán hàng', groupCode: 'market', icon: 'TrendingUp', color: 'hsl(355, 70%, 55%)', href: '/dashboard/sms', orderIndex: 10 },
    { code: 'OMS', name: 'Orders', nameVi: 'Quản lý Đơn hàng', groupCode: 'market', icon: 'ClipboardList', color: 'hsl(195, 70%, 45%)', href: '/dashboard/oms', orderIndex: 11 },
    { code: 'DMS', name: 'Distribution', nameVi: 'Quản lý Phân phối', groupCode: 'market', icon: 'Network', color: 'hsl(160, 55%, 42%)', href: '/dashboard/dms', orderIndex: 12 },
    { code: 'AMS', name: 'Accounting', nameVi: 'Quản lý Kế toán', groupCode: 'finance', icon: 'Calculator', color: 'hsl(38, 90%, 50%)', href: '/dashboard/ams', orderIndex: 13 },
    { code: 'CMS', name: 'Controlling', nameVi: 'Quản trị & Kiểm soát', groupCode: 'finance', icon: 'Target', color: 'hsl(0, 70%, 55%)', href: '/dashboard/cms', orderIndex: 14 },
    { code: 'BMS', name: 'Business Intel', nameVi: 'BI & Báo cáo', groupCode: 'finance', icon: 'BarChart3', color: 'hsl(220, 75%, 55%)', href: '/dashboard/bms', orderIndex: 15 },
  ];

  const modules: Record<string, string> = {};
  for (const m of modulesData) {
    const mod = await prisma.module.upsert({
      where: { code: m.code },
      update: m,
      create: m,
    });
    modules[m.code] = mod.id;
  }
  console.log(`  ✅ ${Object.keys(modules).length} modules created\n`);

  // ━━━ 2. TẠO ROLES ━━━
  console.log('🔐 Tạo Roles...');

  // System roles
  const rolesData = [
    { code: 'super_admin', name: 'Quản trị tối cao', description: 'Toàn quyền hệ thống, không giới hạn', groupCode: null, isSystem: true },
    { code: 'admin', name: 'Quản trị viên', description: 'Quản lý hệ thống, cấu hình module', groupCode: null, isSystem: true },
    // Foundation group roles
    { code: 'foundation_exec', name: 'Nền tảng - Thực thi', description: 'Xem và thao tác trên CORE/IMS/HMS', groupCode: 'foundation', isSystem: true },
    { code: 'foundation_view', name: 'Nền tảng - Xem', description: 'Chỉ xem dữ liệu CORE/IMS/HMS', groupCode: 'foundation', isSystem: true },
    // Operations group roles
    { code: 'operations_exec', name: 'Vận hành - Thực thi', description: 'Xem và thao tác trên PMS/WMS/TMS', groupCode: 'operations', isSystem: true },
    { code: 'operations_view', name: 'Vận hành - Xem', description: 'Chỉ xem dữ liệu PMS/WMS/TMS', groupCode: 'operations', isSystem: true },
    // Market group roles
    { code: 'market_exec', name: 'Thị trường - Thực thi', description: 'Xem và thao tác trên FMS/QMS/RMS/MMS/SMS/OMS/DMS', groupCode: 'market', isSystem: true },
    { code: 'market_view', name: 'Thị trường - Xem', description: 'Chỉ xem dữ liệu FMS/QMS/RMS/MMS/SMS/OMS/DMS', groupCode: 'market', isSystem: true },
    // Finance group roles
    { code: 'finance_exec', name: 'Tài chính - Thực thi', description: 'Xem và thao tác trên AMS/CMS/BMS', groupCode: 'finance', isSystem: true },
    { code: 'finance_view', name: 'Tài chính - Xem', description: 'Chỉ xem dữ liệu AMS/CMS/BMS', groupCode: 'finance', isSystem: true },
  ];

  const roles: Record<string, string> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description, groupCode: r.groupCode, isSystem: r.isSystem },
      create: r,
    });
    roles[r.code] = role.id;
  }
  console.log(`  ✅ ${Object.keys(roles).length} roles created\n`);

  // ━━━ 3. TẠO ROLE-MODULE PERMISSIONS ━━━
  console.log('🛡️  Gán quyền Role → Module...');

  const groupModules: Record<string, string[]> = {
    foundation: ['CORE', 'IMS', 'HMS'],
    operations: ['PMS', 'WMS', 'TMS'],
    market: ['FMS', 'QMS', 'RMS', 'MMS', 'SMS', 'OMS', 'DMS'],
    finance: ['AMS', 'CMS', 'BMS'],
  };

  const allModuleCodes = Object.values(groupModules).flat();

  // super_admin → full access all modules
  for (const code of allModuleCodes) {
    await prisma.roleModulePermission.upsert({
      where: { roleId_moduleId: { roleId: roles['super_admin'], moduleId: modules[code] } },
      update: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      create: { roleId: roles['super_admin'], moduleId: modules[code], canView: true, canCreate: true, canEdit: true, canDelete: true },
    });
  }

  // admin → full access all except IMS
  for (const code of allModuleCodes) {
    const isIMS = code === 'IMS';
    await prisma.roleModulePermission.upsert({
      where: { roleId_moduleId: { roleId: roles['admin'], moduleId: modules[code] } },
      update: { canView: !isIMS, canCreate: !isIMS, canEdit: !isIMS, canDelete: !isIMS },
      create: { roleId: roles['admin'], moduleId: modules[code], canView: !isIMS, canCreate: !isIMS, canEdit: !isIMS, canDelete: !isIMS },
    });
  }

  // Group exec roles → full CRUD on their group's modules + view Dashboard
  // Group view roles → view only on their group's modules + view Dashboard
  for (const [group, moduleCodes] of Object.entries(groupModules)) {
    const execRoleId = roles[`${group}_exec`];
    const viewRoleId = roles[`${group}_view`];

    // Grant Dashboard (CORE) view access to all group roles
    await prisma.roleModulePermission.upsert({
      where: { roleId_moduleId: { roleId: execRoleId, moduleId: modules['CORE'] } },
      update: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      create: { roleId: execRoleId, moduleId: modules['CORE'], canView: true, canCreate: false, canEdit: false, canDelete: false },
    });
    await prisma.roleModulePermission.upsert({
      where: { roleId_moduleId: { roleId: viewRoleId, moduleId: modules['CORE'] } },
      update: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      create: { roleId: viewRoleId, moduleId: modules['CORE'], canView: true, canCreate: false, canEdit: false, canDelete: false },
    });

    for (const code of moduleCodes) {
      if (code === 'CORE') continue; // already handled

      // exec → full CRUD
      await prisma.roleModulePermission.upsert({
        where: { roleId_moduleId: { roleId: execRoleId, moduleId: modules[code] } },
        update: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        create: { roleId: execRoleId, moduleId: modules[code], canView: true, canCreate: true, canEdit: true, canDelete: true },
      });

      // view → view only
      await prisma.roleModulePermission.upsert({
        where: { roleId_moduleId: { roleId: viewRoleId, moduleId: modules[code] } },
        update: { canView: true, canCreate: false, canEdit: false, canDelete: false },
        create: { roleId: viewRoleId, moduleId: modules[code], canView: true, canCreate: false, canEdit: false, canDelete: false },
      });
    }
  }
  console.log('  ✅ Permission matrix created\n');

  // ━━━ 4. TẠO DEPARTMENTS ━━━
  console.log('🏢 Tạo Phòng ban...');
  const deptsData = [
    { code: 'BGD', name: 'Ban Giám đốc', description: 'Lãnh đạo cấp cao' },
    { code: 'IT', name: 'Phòng CNTT', description: 'Công nghệ thông tin & hạ tầng' },
    { code: 'HR', name: 'Phòng Nhân sự', description: 'Tuyển dụng, đào tạo, phúc lợi' },
    { code: 'SALE', name: 'Phòng Kinh doanh', description: 'Bán hàng, chăm sóc khách hàng' },
    { code: 'MKT', name: 'Phòng Marketing', description: 'Truyền thông, quảng bá thương hiệu' },
    { code: 'SX', name: 'Phòng Sản xuất', description: 'Vận hành nhà máy, dây chuyền' },
    { code: 'QC', name: 'Phòng QA/QC', description: 'Kiểm soát chất lượng sản phẩm' },
    { code: 'KHO', name: 'Phòng Kho vận', description: 'Quản lý kho bãi, giao nhận' },
    { code: 'KT', name: 'Phòng Kế toán', description: 'Hạch toán, công nợ, thuế' },
    { code: 'RD', name: 'Phòng R&D', description: 'Nghiên cứu & phát triển sản phẩm mới' },
  ];

  const depts: Record<string, string> = {};
  for (const d of deptsData) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: d,
      create: d,
    });
    depts[d.code] = dept.id;
  }
  console.log(`  ✅ ${Object.keys(depts).length} departments created\n`);

  // ━━━ 5. TẠO USERS ━━━
  console.log('👤 Tạo Users...');
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const usersData = [
    { email: 'admin@aio.ms', password: adminHash, name: 'Nguyễn Quản Trị', roleCodes: ['super_admin'] },
    { email: 'giamdoc@aio.ms', password: hashedPassword, name: 'Trần Văn Hùng', roleCodes: ['admin'] },
    { email: 'nhansu@aio.ms', password: hashedPassword, name: 'Lê Thị Mai', roleCodes: ['foundation_exec'] },
    { email: 'kho@aio.ms', password: hashedPassword, name: 'Phạm Minh Đức', roleCodes: ['operations_exec'] },
    { email: 'kinhdoanh@aio.ms', password: hashedPassword, name: 'Hoàng Minh Châu', roleCodes: ['market_exec'] },
    { email: 'ketoan@aio.ms', password: hashedPassword, name: 'Ngô Thị Lan Anh', roleCodes: ['finance_exec'] },
    { email: 'nhanvien@aio.ms', password: hashedPassword, name: 'Võ Quốc Bảo', roleCodes: ['operations_view', 'market_view'] }, // Multi-role example
    { email: 'thuctap@aio.ms', password: hashedPassword, name: 'Đặng Thị Hương', roleCodes: ['foundation_view'] },
  ];

  const users: Record<string, string> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password: u.password },
      create: { email: u.email, password: u.password, name: u.name },
    });
    users[u.email] = user.id;

    // Assign roles (many-to-many)
    for (const roleCode of u.roleCodes) {
      if (roles[roleCode]) {
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: roles[roleCode] } },
          update: {},
          create: { userId: user.id, roleId: roles[roleCode] },
        });
      }
    }
  }
  console.log(`  ✅ ${Object.keys(users).length} users created\n`);

  // ━━━ 6. TẠO EMPLOYEES ━━━
  console.log('🧑‍💼 Tạo Employees...');
  const employeesData = [
    { employeeCode: 'NV-001', fullName: 'Nguyễn Quản Trị', email: 'admin@aio.ms', phone: '0901-000-001', departmentCode: 'BGD', position: 'Giám đốc Điều hành', level: 'director', hireDate: new Date('2020-01-15'), status: 'active', salary: 80000000 },
    { employeeCode: 'NV-002', fullName: 'Trần Văn Hùng', email: 'giamdoc@aio.ms', phone: '0901-000-002', departmentCode: 'BGD', position: 'Phó Giám đốc', level: 'director', hireDate: new Date('2020-03-01'), status: 'active', salary: 65000000 },
    { employeeCode: 'NV-003', fullName: 'Lê Thị Mai', email: 'nhansu@aio.ms', phone: '0901-000-003', departmentCode: 'HR', position: 'Trưởng phòng Nhân sự', level: 'manager', hireDate: new Date('2021-06-01'), status: 'active', salary: 35000000 },
    { employeeCode: 'NV-004', fullName: 'Phạm Minh Đức', email: 'kho@aio.ms', phone: '0901-000-004', departmentCode: 'KHO', position: 'Trưởng phòng Kho vận', level: 'manager', hireDate: new Date('2021-08-15'), status: 'active', salary: 32000000 },
    { employeeCode: 'NV-005', fullName: 'Hoàng Minh Châu', email: 'kinhdoanh@aio.ms', phone: '0901-000-005', departmentCode: 'SALE', position: 'Trưởng phòng Kinh doanh', level: 'manager', hireDate: new Date('2022-01-10'), status: 'active', salary: 38000000 },
    { employeeCode: 'NV-006', fullName: 'Ngô Thị Lan Anh', email: 'ketoan@aio.ms', phone: '0901-000-006', departmentCode: 'KT', position: 'Kế toán trưởng', level: 'manager', hireDate: new Date('2021-04-01'), status: 'active', salary: 34000000 },
    { employeeCode: 'NV-007', fullName: 'Võ Quốc Bảo', email: 'nhanvien@aio.ms', phone: '0901-000-007', departmentCode: 'SALE', position: 'Nhân viên Kinh doanh', level: 'mid', hireDate: new Date('2023-02-15'), status: 'active', salary: 18000000 },
    { employeeCode: 'NV-008', fullName: 'Đặng Thị Hương', email: 'thuctap@aio.ms', phone: '0901-000-008', departmentCode: 'HR', position: 'Thực tập sinh', level: 'intern', hireDate: new Date('2026-03-01'), status: 'probation', salary: 5000000 },
    { employeeCode: 'NV-009', fullName: 'Trần Quốc Hùng', email: 'qc.hung@aio.ms', phone: '0901-000-009', departmentCode: 'QC', position: 'Nhân viên QC', level: 'senior', hireDate: new Date('2022-05-20'), status: 'active', salary: 22000000 },
    { employeeCode: 'NV-010', fullName: 'Nguyễn Thị Bích', email: 'rd.bich@aio.ms', phone: '0901-000-010', departmentCode: 'RD', position: 'Chuyên viên R&D', level: 'senior', hireDate: new Date('2022-09-01'), status: 'active', salary: 25000000 },
    { employeeCode: 'NV-011', fullName: 'Lê Hoàng Duy', email: 'sx.duy@aio.ms', phone: '0901-000-011', departmentCode: 'SX', position: 'Quản đốc phân xưởng', level: 'lead', hireDate: new Date('2021-11-15'), status: 'active', salary: 28000000 },
    { employeeCode: 'NV-012', fullName: 'Phạm Đức Anh', email: 'mkt.anh@aio.ms', phone: '0901-000-012', departmentCode: 'MKT', position: 'Chuyên viên Marketing', level: 'mid', hireDate: new Date('2023-07-01'), status: 'active', salary: 16000000 },
  ];

  for (const emp of employeesData) {
    const userId = users[emp.email] || null;
    await prisma.employee.upsert({
      where: { employeeCode: emp.employeeCode },
      update: {
        fullName: emp.fullName,
        phone: emp.phone,
        position: emp.position,
        level: emp.level,
        salary: emp.salary,
        status: emp.status,
      },
      create: {
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        departmentId: depts[emp.departmentCode],
        position: emp.position,
        level: emp.level,
        hireDate: emp.hireDate,
        status: emp.status,
        salary: emp.salary,
        userId: userId,
      },
    });
  }
  console.log(`  ✅ ${employeesData.length} employees created\n`);

  // ━━━ SUMMARY ━━━
  console.log('═══════════════════════════════════════');
  console.log('🎉 Khởi tạo dữ liệu hoàn tất!');
  console.log('═══════════════════════════════════════');
  console.log(`  📦 Modules:     ${Object.keys(modules).length}`);
  console.log(`  🔐 Roles:       ${Object.keys(roles).length}`);
  console.log(`  🏢 Departments: ${Object.keys(depts).length}`);
  console.log(`  👤 Users:       ${Object.keys(users).length}`);
  console.log(`  🧑‍💼 Employees:  ${employeesData.length}`);
  console.log('\n📋 Tài khoản đăng nhập:');
  console.log('  admin@aio.ms    / admin123  → Super Admin');
  console.log('  giamdoc@aio.ms  / 123456   → Admin');
  console.log('  nhansu@aio.ms   / 123456   → Foundation Exec');
  console.log('  kho@aio.ms      / 123456   → Operations Exec');
  console.log('  kinhdoanh@aio.ms/ 123456   → Market Exec');
  console.log('  ketoan@aio.ms   / 123456   → Finance Exec');
  console.log('  nhanvien@aio.ms / 123456   → Operations View + Market View (multi-role)');
  console.log('  thuctap@aio.ms  / 123456   → Foundation View');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
