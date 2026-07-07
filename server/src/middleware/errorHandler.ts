import type { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  const status: number = err.status || err.statusCode || 500;
  const message: string = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV === 'development') console.error(err.stack);
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
