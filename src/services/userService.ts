import prisma from '../config/database';
import bcrypt from 'bcrypt';

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUsersByRoles = async (roles: string[]) => {
  return prisma.user.findMany({
    where: { role: { in: roles } },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
};

export const createUser = async (data: {
  email: string;
  name?: string;
  password: string;
  role: string;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return user;
};

export const updateUser = async (
  id: number,
  data: {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
  }
) => {
  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({ where: { id } });
};

