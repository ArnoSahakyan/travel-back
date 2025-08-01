import { Request } from 'express';
import { ParsedQs } from 'qs';

export type TypedRequest<
    Params = Record<string, string>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs
> = Request<Params, ResBody, ReqBody, ReqQuery>;

export interface AuthenticatedRequest<
    Params = Record<string, string>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
    user_id?: number;
    user_role?: 'customer' | 'admin';
}
