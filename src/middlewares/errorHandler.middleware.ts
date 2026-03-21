import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Fallback for uncaught programming or structural errors
  console.error('Unhandled ERROR:', err);
  res.status(500).json({ message: 'Internal server error.' });
};
