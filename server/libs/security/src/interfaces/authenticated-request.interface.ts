import { FastifyRequest } from 'fastify';
import { JwtPayload } from './jwt-payload.interface';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: JwtPayload;
}
