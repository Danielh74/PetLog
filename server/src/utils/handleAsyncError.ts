import type { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const handleAsyncError = (fn: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch(next);
    };
};

export default handleAsyncError;
