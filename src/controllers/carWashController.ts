import { Request, Response } from 'express';
import * as carWashService from '../services/carWashService';

export const getAllCarWashes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const carWashes = await carWashService.getAllCarWashes();
    res.json(carWashes);
  } catch (error) {
    console.error('Get all car washes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCarWashById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const carWash = await carWashService.getCarWashById(id);

    if (!carWash) {
      res.status(404).json({ error: 'Car wash not found' });
      return;
    }

    res.json(carWash);
  } catch (error) {
    console.error('Get car wash by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCarWash = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, address, city } = req.body;
    const carWash = await carWashService.createCarWash({ name, address, city });
    res.status(201).json(carWash);
  } catch (error) {
    console.error('Create car wash error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCarWash = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const carWash = await carWashService.updateCarWash(id, req.body);

    if (!carWash) {
      res.status(404).json({ error: 'Car wash not found' });
      return;
    }

    res.json(carWash);
  } catch (error) {
    console.error('Update car wash error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCarWash = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await carWashService.deleteCarWash(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete car wash error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

