import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create departments
  const departments = [
    { name: 'Department of Physiotherapy' },
    { name: 'Department of Occupational Therapy' },
    { name: 'Department of Computer Science and Engineering' },
    { name: 'Department of Electronics and Communication Engineering' },
    { name: 'Department of Mechanical Engineering' },
    { name: 'Department of Civil Engineering' },
    { name: 'Department of Information Technology' },
    { name: 'Department of Electrical and Electronics Engineering' },
  ];

  const createdDepartments: Record<string, { id: string; name: string }> = {};
  for (const dept of departments) {
    const created = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    createdDepartments[dept.name] = created;
  }

  const physiotherapy = createdDepartments['Department of Physiotherapy'];
  const occupational = createdDepartments['Department of Occupational Therapy'];
  const cse = createdDepartments['Department of Computer Science and Engineering'];

  console.log('Departments created:', Object.keys(createdDepartments).length);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@srmist.edu.in' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@srmist.edu.in',
      registerNumber: 'ADMIN001',
      password: adminPassword,
      departmentId: cse.id,
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  console.log('Admin user created:', { email: admin.email });

  // Create sample subjects for Physiotherapy
  const physioSubjects = [
    { code: 'PT101', name: 'Anatomy', semester: 1, departmentId: physiotherapy.id },
    { code: 'PT102', name: 'Physiology', semester: 1, departmentId: physiotherapy.id },
    { code: 'PT201', name: 'Biomechanics', semester: 2, departmentId: physiotherapy.id },
    { code: 'PT202', name: 'Kinesiology', semester: 2, departmentId: physiotherapy.id },
    { code: 'PT301', name: 'General Medicine', semester: 3, departmentId: physiotherapy.id },
    { code: 'PT302', name: 'General Surgery', semester: 3, departmentId: physiotherapy.id },
    { code: 'PT401', name: 'Musculoskeletal Physiotherapy', semester: 4, departmentId: physiotherapy.id },
    { code: 'PT402', name: 'Neurological Physiotherapy', semester: 4, departmentId: physiotherapy.id },
  ];

  for (const subject of physioSubjects) {
    await prisma.subject.upsert({
      where: { code_departmentId: { code: subject.code, departmentId: subject.departmentId } },
      update: {},
      create: subject,
    });
  }

  // Create sample subjects for Occupational Therapy
  const otSubjects = [
    { code: 'OT101', name: 'Introduction to Occupational Therapy', semester: 1, departmentId: occupational.id },
    { code: 'OT102', name: 'Human Anatomy & Physiology', semester: 1, departmentId: occupational.id },
    { code: 'OT201', name: 'Functional Anatomy', semester: 2, departmentId: occupational.id },
    { code: 'OT202', name: 'Psychology', semester: 2, departmentId: occupational.id },
    { code: 'OT301', name: 'Therapeutic Media', semester: 3, departmentId: occupational.id },
    { code: 'OT302', name: 'Rehabilitation', semester: 3, departmentId: occupational.id },
  ];

  for (const subject of otSubjects) {
    await prisma.subject.upsert({
      where: { code_departmentId: { code: subject.code, departmentId: subject.departmentId } },
      update: {},
      create: subject,
    });
  }

  // Create sample subjects for Computer Science and Engineering
  const cseSubjects = [
    { code: 'CSE101', name: 'Programming in C', semester: 1, departmentId: cse.id },
    { code: 'CSE102', name: 'Data Structures', semester: 2, departmentId: cse.id },
    { code: 'CSE201', name: 'Object Oriented Programming', semester: 3, departmentId: cse.id },
    { code: 'CSE202', name: 'Database Management Systems', semester: 3, departmentId: cse.id },
    { code: 'CSE301', name: 'Operating Systems', semester: 4, departmentId: cse.id },
    { code: 'CSE302', name: 'Computer Networks', semester: 4, departmentId: cse.id },
    { code: 'CSE401', name: 'Software Engineering', semester: 5, departmentId: cse.id },
    { code: 'CSE402', name: 'Machine Learning', semester: 6, departmentId: cse.id },
  ];

  for (const subject of cseSubjects) {
    await prisma.subject.upsert({
      where: { code_departmentId: { code: subject.code, departmentId: subject.departmentId } },
      update: {},
      create: subject,
    });
  }

  console.log('Subjects created');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
