import { Request, Response } from 'express';
import { login as authLogin } from '../services/authService';
import { LoginRequest } from '../types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials: LoginRequest = req.body;
    const result = await authLogin(credentials);

    if (!result) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

