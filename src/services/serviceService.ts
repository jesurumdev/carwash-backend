import prisma from '../config/database';

export const getServicesByCarWashId = async (carWashId: number) => {
  return prisma.service.findMany({
    where: { carWashId, active: true },
    orderBy: { name: 'asc' },
  });
};

export const getServiceById = async (id: number) => {
  return prisma.service.findUnique({
    where: { id },
  });
};

export const createService = async (data: {
  carWashId: number;
  name: string;
  price: number;
  durationMin: number;
}) => {
  return prisma.service.create({
    data: {
      carWashId: data.carWashId,
      name: data.name,
      price: data.price,
      durationMin: data.durationMin,
    },
  });
};

export const updateService = async (
  id: number,
  data: {
    name?: string;
    price?: number;
    durationMin?: number;
    active?: boolean;
  }
) => {
  return prisma.service.update({
    where: { id },
    data,
  });
};

export const deleteService = async (id: number) => {
  await prisma.service.delete({
    where: { id },
  });
};
