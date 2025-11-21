import { Request, Response } from 'express';
import * as serviceService from '../services/serviceService';

export const getServicesByCarWashId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const carWashId = parseInt(req.params.id);
    const services = await serviceService.getServicesByCarWashId(carWashId);
    res.json(services);
  } catch (error) {
    console.error('Get services by car wash id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getServiceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.serviceId);
    const service = await serviceService.getServiceById(id);

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json(service);
  } catch (error) {
    console.error('Get service by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const carWashId = parseInt(req.params.id);
    const { name, price, durationMin } = req.body;
    const service = await serviceService.createService({
      carWashId,
      name,
      price,
      durationMin,
    });
    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.serviceId);
    const service = await serviceService.updateService(id, req.body);

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.serviceId);
    await serviceService.deleteService(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

