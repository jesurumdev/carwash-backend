import prisma from '../config/database';

export const getAllCarWashes = async () => {
  return prisma.carWash.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
};

export const getCarWashById = async (id: number) => {
  return prisma.carWash.findUnique({
    where: { id },
  });
};

export const createCarWash = async (data: {
  name: string;
  address: string;
  city: string;
}) => {
  return prisma.carWash.create({ data });
};

export const updateCarWash = async (
  id: number,
  data: {
    name?: string;
    address?: string;
    city?: string;
    active?: boolean;
  }
) => {
  return prisma.carWash.update({ where: { id }, data });
};

export const deleteCarWash = async (id: number) => {
  return prisma.carWash.delete({ where: { id } });
};

