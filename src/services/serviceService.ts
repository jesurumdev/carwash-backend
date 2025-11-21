import prisma from '../config/database';

export const getServicesByCarWashId = async (carWashId: number) => {
  // TODO: Implement get services by car wash id
  return [];
};

export const getServiceById = async (id: number) => {
  // TODO: Implement get service by id
  return null;
};

export const createService = async (data: {
  carWashId: number;
  name: string;
  price: number;
  durationMin: number;
}) => {
  // TODO: Implement create service
  return null;
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
  // TODO: Implement update service
  return null;
};

export const deleteService = async (id: number) => {
  // TODO: Implement delete service
  return null;
};

