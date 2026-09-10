import { Request, Response, NextFunction } from 'express';

export const validate = (schema: { parse: (data: any) => any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const message = error?.errors?.[0]?.message || error?.message || 'Validation error';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };
};
