import { RequestHandler, Request, Response, NextFunction } from 'express';

export function asHandler<TParams = any, TResBody = any, TReqBody = any, TQuery = any>(
    handler: (req: Request<TParams, TResBody, TReqBody, TQuery>, res: Response, next: NextFunction) => any
): RequestHandler {
    return handler as unknown as RequestHandler;
}
