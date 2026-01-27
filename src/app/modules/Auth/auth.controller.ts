import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const register = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Registration failed',
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'User logged in successfully!',
      data: result,
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.message || 'Login failed',
    });
  }
};

export const AuthController = {
  register,
  login,
};