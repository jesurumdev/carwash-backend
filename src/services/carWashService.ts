import prisma from '../config/database';

export const getAllCarWashes = async () => {
  // TODO: Implement get all car washes
  return [];
};

export const getCarWashById = async (id: number) => {
  // TODO: Implement get car wash by id
  return null;
};

export const createCarWash = async (data: {
  name: string;
  address: string;
  city: string;
}) => {
  // TODO: Implement create car wash
  return null;
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
  // TODO: Implement update car wash
  return null;
};

export const deleteCarWash = async (id: number) => {
  // TODO: Implement delete car wash
  return null;
};

