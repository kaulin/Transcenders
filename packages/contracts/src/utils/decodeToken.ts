import { Value } from '@sinclair/typebox/value';
import { JWTPayload, JWTPayloadSchema } from '../auth.schemas';

export function decodeToken(token: string): JWTPayload {
  const tokenSplit = token.split('.');

  //index one after split by . is the actual payloaded object
  const decoded = Buffer.from(tokenSplit[1], 'base64');
  const payload = JSON.parse(decoded.toString());
  if (!Value.Check(JWTPayloadSchema, payload)) {
    throw new Error('Invalid JWT payload format');
  }
  return payload as JWTPayload;
}
