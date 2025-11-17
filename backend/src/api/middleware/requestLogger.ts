import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info(`→ ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
    });
  });

  next();
};
