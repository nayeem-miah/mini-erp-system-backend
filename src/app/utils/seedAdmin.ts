import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import config from '../config';
import { prisma } from '../prisma/prisma';

interface IUser {
  name: string;
  email: string;
  role: UserRole;
}

export const seedAdmin = async () => {
  const defaultPassword = '123456';
  const hashedPassword = await bcrypt.hash(
    defaultPassword,
    config.salt_rounds || 10,
  );

  const seedUsers: IUser[] = [
    {
      name: 'System Admin',
      email: config.admin.email || 'admin@gmail.com',
      role: UserRole.ADMIN,
    },
    {
      name: 'Manager',
      email: 'manager@gmail.com',
      role: UserRole.MANAGER,
    },
    {
      name: 'Employee',
      email: 'employee@gmail.com',
      role: UserRole.EMPLOYEE,
    },
  ];

  for (const user of seedUsers) {
    const isExistUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!isExistUser) {
      const result = await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
          profilePicture: 'https://i.ibb.co.com/q2gwGfV/356306451-54b19ada-d53e-4ee9-8882-9dfed1bf1396.jpg',
        },
      });
      console.log(`Seeded default ${user.role} user:`, result.email);
    }
  }
};
