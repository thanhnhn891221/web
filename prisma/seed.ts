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

  // ━━━ 7. TẠO SUPPLIERS (PMS) ━━━
  console.log('🏭 Tạo Suppliers...');
  const suppliersData = [
    { code: 'NCC-001', name: 'Công ty TNHH Nguyên liệu Sài Gòn', contact: 'Nguyễn Văn Bình', email: 'binh@nlsg.vn', phone: '028-1234-5678', category: 'Nguyên vật liệu', rating: 4.8, status: 'active' },
    { code: 'NCC-002', name: 'Nhà máy Bao bì Đồng Nai', contact: 'Trần Thị Cúc', email: 'cuc@bbdn.vn', phone: '0251-234-5678', category: 'Bao bì', rating: 4.5, status: 'active' },
    { code: 'NCC-003', name: 'Đại lý Hóa chất Miền Nam', contact: 'Lê Hoàng Duy', email: 'duy@hcmn.vn', phone: '028-8765-4321', category: 'Hóa chất', rating: 4.2, status: 'active' },
    { code: 'NCC-004', name: 'Công ty CP Máy móc Á Châu', contact: 'Phạm Minh Đức', email: 'duc@mmac.vn', phone: '024-5678-1234', category: 'Máy móc', rating: 4.6, status: 'active' },
    { code: 'NCC-005', name: 'Xưởng Nhựa Tân Phú', contact: 'Hoàng Thị Lan', email: 'lan@ntp.vn', phone: '028-9876-5432', category: 'Nhựa', rating: 3.9, status: 'inactive' },
  ];

  const suppliers: Record<string, string> = {};
  for (const s of suppliersData) {
    const sup = await prisma.supplier.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
    suppliers[s.code] = sup.id;
  }
  console.log(`  ✅ ${Object.keys(suppliers).length} suppliers created\n`);

  // ━━━ 8. TẠO PURCHASE ORDERS (PMS) ━━━
  console.log('🛒 Tạo Purchase Orders...');
  const poData = [
    { code: 'PO-2026-001', supplierCode: 'NCC-001', expectedDate: new Date('2026-04-05'), status: 'approved', note: 'Đơn gấp cho dây chuyền SX #2', createdByEmail: 'admin@aio.ms', 
      items: [{ name: 'Bột mì cao cấp', qty: 500, unit: 'kg', price: 18000 }, { name: 'Đường tinh luyện', qty: 300, unit: 'kg', price: 22000 }] },
    { code: 'PO-2026-002', supplierCode: 'NCC-002', expectedDate: new Date('2026-04-03'), status: 'ordered', createdByEmail: 'kho@aio.ms', 
      items: [{ name: 'Hộp carton 30x20x15', qty: 2000, unit: 'cái', price: 5500 }] },
    { code: 'PO-2026-003', supplierCode: 'NCC-003', expectedDate: new Date('2026-04-10'), status: 'pending', createdByEmail: 'admin@aio.ms', 
      items: [{ name: 'Chất tẩy rửa công nghiệp', qty: 50, unit: 'thùng', price: 450000 }] },
  ];

  for (const po of poData) {
    const total = po.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const order = await prisma.purchaseOrder.upsert({
      where: { code: po.code },
      update: { totalAmount: total, status: po.status },
      create: { 
        code: po.code, supplierId: suppliers[po.supplierCode], totalAmount: total, status: po.status, 
        expectedDate: po.expectedDate, note: po.note, createdById: users[po.createdByEmail] 
      },
    });

    for (const item of po.items) {
      // Very naive check to prevent duplicate inserts on re-seed, ideally delete many and insert
      const existingItem = await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: order.id, itemName: item.name } });
      if (!existingItem) {
        await prisma.purchaseOrderItem.create({
          data: {
            purchaseOrderId: order.id, itemName: item.name, quantity: item.qty, unit: item.unit, unitPrice: item.price, totalPrice: item.qty * item.price
          }
        });
      }
    }
  }
  console.log(`  ✅ ${poData.length} purchase orders created\n`);

  // ━━━ 9. TẠO WAREHOUSES & INVENTORY (WMS) ━━━
  console.log('🏭 Tạo Warehouses & Inventory...');
  const warehousesData = [
    { code: 'KHO-BD', name: 'Kho Trung tâm Bình Dương', address: 'KCN Mỹ Phước 3, Bình Dương', capacity: 5000, usedCapacity: 3750, managerEmail: 'kho@aio.ms', status: 'active' },
    { code: 'KHO-HCM', name: 'Kho Chi nhánh TP.HCM', address: 'Q.Thủ Đức, TP.HCM', capacity: 2000, usedCapacity: 1680, status: 'active' },
    { code: 'KHO-DN', name: 'Kho Nguyên liệu Đồng Nai', address: 'KCN Amata, Đồng Nai', capacity: 3000, usedCapacity: 2100, status: 'active' },
  ];

  const wmsLocations: Record<string, string> = {};
  for (const w of warehousesData) {
    const wh = await prisma.warehouse.upsert({
      where: { code: w.code },
      update: { capacity: w.capacity, usedCapacity: w.usedCapacity },
      create: { code: w.code, name: w.name, address: w.address, capacity: w.capacity, usedCapacity: w.usedCapacity, managerId: w.managerEmail ? users[w.managerEmail] : null, status: w.status },
    });
    wmsLocations[w.code] = wh.id;
  }

  const inventoryData = [
    { sku: 'NVL-001', name: 'Bột mì cao cấp', category: 'Nguyên vật liệu', whCode: 'KHO-DN', zone: 'A1', quantity: 2500, minStock: 500, unit: 'kg', status: 'in_stock' },
    { sku: 'NVL-002', name: 'Đường tinh luyện', category: 'Nguyên vật liệu', whCode: 'KHO-DN', zone: 'A2', quantity: 180, minStock: 200, unit: 'kg', status: 'low_stock' },
    { sku: 'BB-001', name: 'Hộp carton 30x20x15', category: 'Bao bì', whCode: 'KHO-BD', zone: 'B1', quantity: 8500, minStock: 1000, unit: 'cái', status: 'in_stock' },
    { sku: 'TP-001', name: 'Bánh quy vị bơ 200g', category: 'Thành phẩm', whCode: 'KHO-BD', zone: 'C1', quantity: 12000, minStock: 2000, unit: 'hộp', status: 'in_stock' },
  ];

  for (const inv of inventoryData) {
    await prisma.inventoryItem.upsert({
      where: { sku: inv.sku },
      update: { quantity: inv.quantity, status: inv.status },
      create: { sku: inv.sku, name: inv.name, category: inv.category, warehouseId: wmsLocations[inv.whCode], zone: inv.zone, quantity: inv.quantity, minStock: inv.minStock, unit: inv.unit, status: inv.status },
    });
  }

  const movementsData = [
    { type: 'in', itemName: 'Bột mì cao cấp', sku: 'NVL-001', quantity: 500, unit: 'kg', toWhCode: 'KHO-DN', reason: 'Nhập từ PO-2026-001', refCode: 'PO-2026-001', createdByEmail: 'admin@aio.ms' },
    { type: 'out', itemName: 'Bánh quy vị bơ 200g', sku: 'TP-001', quantity: 2000, unit: 'hộp', fromWhCode: 'KHO-BD', reason: 'Xuất cho đơn hàng OMS-1254', refCode: 'OMS-1254', createdByEmail: 'kho@aio.ms' },
  ];

  for (const mov of movementsData) {
    const existingMov = await prisma.stockMovement.findFirst({ where: { refCode: mov.refCode, type: mov.type } });
    if (!existingMov) {
      await prisma.stockMovement.create({
        data: {
          type: mov.type, itemName: mov.itemName, sku: mov.sku, quantity: mov.quantity, unit: mov.unit,
          fromWarehouseId: mov.fromWhCode ? wmsLocations[mov.fromWhCode] : null,
          toWarehouseId: mov.toWhCode ? wmsLocations[mov.toWhCode] : null,
          reason: mov.reason, refCode: mov.refCode, createdById: users[mov.createdByEmail]
        }
      });
    }
  }
  console.log(`  ✅ Warehouses and Inventory created\n`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 7C SEED: OMS, SMS & TMS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('🤝 Tạo Customers...');
  const customersData = [
    { name: 'Siêu thị CoopMart', phone: '0901234567', email: 'contact@coopmart.vn', type: 'B2B', tier: 'gold' },
    { name: 'Bách Hóa Xanh', phone: '0902345678', email: 'info@bachhoaxanh.vn', type: 'B2B', tier: 'platinum' },
    { name: 'Mini Stop Q.1', phone: '0903456789', email: 'ministopq1@gmail.com', type: 'B2B', tier: 'standard' },
    { name: 'Khách hàng Cầm Tay', phone: '0909999999', email: 'khachle@gmail.com', type: 'B2C', tier: 'standard' },
  ];
  const customers: Record<string, string> = {};
  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { id: c.name.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: {
        id: c.name.replace(/\s+/g, '-').toLowerCase(),
        name: c.name, phone: c.phone, email: c.email, type: c.type, tier: c.tier
      }
    });
    customers[c.name] = cust.id;
  }
  console.log(`  ✅ ${customersData.length} customers created`);

  console.log('\n📦 Tạo Sales Orders & Items...');
  const soData = [
    { code: 'OMS-1254', customerName: 'Siêu thị CoopMart', status: 'processing', amount: 18500000, items: [{ name: 'Sữa tươi', qty: 100, price: 185000, unit: 'Thùng' }] },
    { code: 'OMS-1255', customerName: 'Bách Hóa Xanh', status: 'shipped', amount: 7200000, items: [{ name: 'Bánh mì', qty: 200, price: 36000, unit: 'Gói' }] },
    { code: 'OMS-1256', customerName: 'Mini Stop Q.1', status: 'pending', amount: 3800000, items: [{ name: 'Nước ngọt', qty: 50, price: 76000, unit: 'Thùng' }] },
  ];
  for (const o of soData) {
    const existing = await prisma.salesOrder.findUnique({ where: { code: o.code } });
    if (!existing) {
      await prisma.salesOrder.create({
        data: {
          code: o.code, customerId: customers[o.customerName], totalAmount: o.amount, status: o.status,
          items: {
            create: o.items.map(i => ({ itemName: i.name, quantity: i.qty, unit: i.unit, unitPrice: i.price, totalPrice: i.qty * i.price }))
          }
        }
      });
    }
  }
  console.log(`  ✅ ${soData.length} sales orders created`);

  console.log('\n🎯 Tạo Leads...');
  const leadsData = [
    { name: 'Nguyễn Văn A', company: 'Công ty ABC', phone: '0900111222', status: 'new', value: 5000000, priority: 'high' },
    { name: 'Trần Thị B', company: 'Cửa hàng tiện lợi Z', phone: '0900222333', status: 'contacted', value: 12000000, priority: 'medium' },
  ];
  for (const l of leadsData) {
    const existing = await prisma.lead.findFirst({ where: { phone: l.phone } });
    if (!existing) {
      await prisma.lead.create({ data: { name: l.name, company: l.company, phone: l.phone, status: l.status, value: l.value, priority: l.priority } });
    }
  }
  console.log(`  ✅ ${leadsData.length} leads created`);

  console.log('\n🚚 Tạo Drivers & Shipments...');
  const driversData = [
    { name: 'Nguyễn Hoàng Long', phone: '0912-345-678', vehicle: 'Xe tải 1.5T', plate: '51A-12345', status: 'on_route' },
    { name: 'Trần Đức Mạnh', phone: '0923-456-789', vehicle: 'Xe tải 2T', plate: '60C-67890', status: 'available' },
  ];
  const driversObj: Record<string, string> = {};
  for (const d of driversData) {
    const existing = await prisma.driver.findFirst({ where: { name: d.name } });
    if (existing) { driversObj[d.name] = existing.id; } else {
      const cr = await prisma.driver.create({ data: { name: d.name, phone: d.phone, vehicle: d.vehicle, licensePlate: d.plate, status: d.status } });
      driversObj[d.name] = cr.id;
    }
  }

  const so1 = await prisma.salesOrder.findUnique({ where: { code: 'OMS-1254' } });
  const so2 = await prisma.salesOrder.findUnique({ where: { code: 'OMS-1255' } });
  const shipData = [
    { code: 'SHP-001', soId: so1?.id, cust: 'Siêu thị CoopMart', addr: '242 Lê Hồng Phong', drv: 'Nguyễn Hoàng Long', items: 15, status: 'in_transit' },
    { code: 'SHP-002', soId: so2?.id, cust: 'Bách Hóa Xanh', addr: '45 Đại lộ Bình Dương', drv: 'Trần Đức Mạnh', items: 8, status: 'picked_up' },
  ];
  for (const s of shipData) {
    const existing = await prisma.shipment.findUnique({ where: { code: s.code } });
    if (!existing) {
      await prisma.shipment.create({
        data: {
          code: s.code, salesOrderId: s.soId, customerName: s.cust, address: s.addr, itemsCount: s.items, status: s.status, driverId: driversObj[s.drv]
        }
      });
    }
  }
  console.log(`  ✅ Drivers and Shipments created\n`);

  console.log('\n💰 Tạo Finance Data (FMS, AMS, BMS)...');
  const transactionsData = [
    { code: 'GL-001', date: new Date('2026-03-31'), description: 'Doanh thu bán hàng OMS-1254', account: '511 - Doanh thu', debit: 32000000, credit: 0, type: 'revenue' },
    { code: 'GL-002', date: new Date('2026-03-31'), description: 'Chi phí NVL PO-001', account: '621 - Chi phí NVL', debit: 0, credit: 15600000, type: 'expense' },
    { code: 'GL-003', date: new Date('2026-03-31'), description: 'Lương tháng 3/2026', account: '334 - Phải trả CNV', debit: 0, credit: 248000000, type: 'expense' },
    { code: 'GL-004', date: new Date('2026-03-30'), description: 'Thu tiền KH CoopMart', account: '131 - Phải thu KH', debit: 18500000, credit: 0, type: 'receivable' },
    { code: 'GL-005', date: new Date('2026-03-30'), description: 'Thanh toán NCC Bao Bì ĐN', account: '331 - Phải trả NCC', debit: 0, credit: 11000000, type: 'payable' },
  ];
  for (const t of transactionsData) {
    const existing = await prisma.transaction.findUnique({ where: { code: t.code } });
    if (!existing) {
      await prisma.transaction.create({ data: t });
    }
  }

  const invoicesData = [
    { code: 'INV-2026-001', soId: so1?.id, cust: 'Siêu thị CoopMart', custId: customers['Siêu thị CoopMart'], amount: 45000000, dueDate: new Date('2026-04-05'), status: 'unpaid' },
    { code: 'INV-2026-002', soId: so2?.id, cust: 'Bách Hóa Xanh', custId: customers['Bách Hóa Xanh'], amount: 32000000, dueDate: new Date('2026-04-10'), status: 'paid' },
  ];
  for (const i of invoicesData) {
    const existing = await prisma.invoice.findUnique({ where: { code: i.code } });
    if (!existing) {
      await prisma.invoice.create({
        data: { code: i.code, salesOrderId: i.soId, customerId: i.custId, customerName: i.cust, amount: i.amount, dueDate: i.dueDate, status: i.status }
      });
    }
  }

  const budgetsData = [
    { name: 'Phòng Bán Hàng', deptId: depts['SALE'], period: 'Q2/2026', allocated: 500000000, spent: 120000000 },
    { name: 'Phòng Sản xuất', deptId: depts['SX'], period: 'Q2/2026', allocated: 2000000000, spent: 850000000 },
    { name: 'Phòng Nhân sự', deptId: depts['HR'], period: 'Q2/2026', allocated: 150000000, spent: 45000000 },
  ];
  for (const b of budgetsData) {
    // Just simple create for budget
    await prisma.budget.create({
      data: { departmentId: b.deptId, departmentName: b.name, period: b.period, allocated: b.allocated, spent: b.spent }
    });
  }
  console.log(`  ✅ Finance data created\n`);

  // ━━━ SUMMARY ━━━
  console.log('═══════════════════════════════════════');
  console.log('🎉 Khởi tạo dữ liệu hoàn tất!');
  console.log('═══════════════════════════════════════');
  console.log(`  📦 Modules:     ${Object.keys(modules).length}`);
  console.log(`  👤 Users:       ${Object.keys(users).length}`);
  console.log(`  🛒 POs:         ${poData.length}`);
  console.log(`  🤝 Customers:   ${customersData.length}`);
  console.log(`  📈 SalesOrders: ${soData.length}`);
  console.log('\n📋 Tài khoản đăng nhập đã sẵn sàng!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
