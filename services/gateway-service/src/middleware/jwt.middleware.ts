import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret'; // TODO

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ success: false, error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET);
  } catch {
    return reply.status(401).send({ success: false, error: 'Invalid or expired token' }); // TODO: format
  }
}