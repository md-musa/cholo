import { Request, Response } from 'express';

const routeNotFoundError = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route is not found!',
    errorMessages: [
      {
        path: `${req.path}`,
        message: '',
      },
    ],
    stack: '',
  });
};

export default routeNotFoundError;