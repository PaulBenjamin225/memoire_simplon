const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Nettoyer les anciennes données pour éviter les doublons
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Seeding database...');
  const managerPassword = await bcrypt.hash('manager123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  const manager = await prisma.user.create({
    data: {
      name: 'Alice Manager',
      email: 'manager@taskflow.com',
      password: managerPassword,
      role: 'MANAGER',
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: 'Bob Employé',
      email: 'employee@taskflow.com',
      password: employeePassword,
      role: 'EMPLOYEE',
    },
  });

  // Créer des tâches pour Bob
  await prisma.task.create({
    data: {
      title: 'Préparer la présentation client',
      description: 'Compiler les chiffres du T3 et créer les slides.',
      deadline: new Date('2024-10-25T17:00:00Z'),
      status: 'TODO',
      assignedToId: employee.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Rapport hebdomadaire',
      description: 'Finaliser et envoyer le rapport de la semaine.',
      deadline: new Date('2024-10-22T12:00:00Z'),
      status: 'DONE',
      assignedToId: employee.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Contacter le fournisseur TechCorp',
      deadline: new Date('2023-09-20T10:00:00Z'), // Une tâche en retard
      status: 'TODO',
      assignedToId: employee.id,
    },
  });
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