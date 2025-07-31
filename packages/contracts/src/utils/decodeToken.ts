import { Value } from '@sinclair/typebox/value';
import { JWTPayload, JWTPayloadSchema } from '../auth.schemas.js';

export function decodeToken(token: string): JWTPayload {
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
  if (!Value.Check(JWTPayloadSchema, payload)) {
    throw new Error('Invalid JWT payload format');
  }
  return payload as JWTPayload;
}
