import { Static, TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { JWTPayload, JWTPayloadSchema } from '../auth.schemas.js';

export function decodeToken<T extends TSchema>(token: string, schema: T): Static<T>;
export function decodeToken(token: string): JWTPayload;
export function decodeToken<T extends TSchema>(token: string, schema?: T): Static<T> | JWTPayload {
  const actualSchema = schema ?? JWTPayloadSchema;

  const tokenSplit = token.split('.');
  if (tokenSplit.length < 2) {
    throw new Error('Malformed JWT token, missing payload');
  }

  //index one after split by . is the actual payloaded object
  const payloadPart = tokenSplit[1];
  if (!payloadPart) {
    throw new Error('Malformed JWT token, missing payload part');
  }
  const decoded = atob(payloadPart);
  const payload = JSON.parse(decoded);
  Value.Assert(actualSchema, payload);
  return payload;
}
