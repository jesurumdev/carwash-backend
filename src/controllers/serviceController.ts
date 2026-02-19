import { Request, Response } from 'express';
import * as serviceService from '../services/serviceService';
import { centsToPesos, pesosToCents } from '../utils/money';

const toPesos = (service: any) => ({
  ...service,
  price:
    service?.price === undefined ? service?.price : centsToPesos(service.price),
});

export const getServicesByCarWashId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const carWashId = parseInt(req.params.id);
    const services = await serviceService.getServicesByCarWashId(carWashId);
    res.json(services.map(toPesos));
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

    res.json(toPesos(service));
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
      price: pesosToCents(price),
      durationMin,
    });
    if (!service) {
      res.status(500).json({ error: 'Failed to create service' });
      return;
    }
    res.status(201).json(toPesos(service));
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
    const updateData = { ...req.body };
    if (updateData.price !== undefined) {
      updateData.price = pesosToCents(updateData.price);
    }
    const service = await serviceService.updateService(id, updateData);

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json(toPesos(service));
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
