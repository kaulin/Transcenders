import { DeviceInfo } from '@transcenders/contracts';
import { FastifyRequest } from 'fastify';

export class DeviceUtils {
  static extractDeviceInfo(request: FastifyRequest): DeviceInfo {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip || request.socket.remoteAddress,
      deviceInfo: this.generateDeviceFingerprint(request),
    };
  }

  private static generateDeviceFingerprint(request: FastifyRequest): string {
    const userAgent = request.headers['user-agent'] ?? 'unknown';
    const acceptLanguage = request.headers['accept-language'] ?? '';
    const acceptEncoding = request.headers['accept-encoding'] ?? '';

    // make a random string out of randome header entries
    return `${userAgent.slice(0, 100)}-${acceptLanguage.slice(0, 20)}-${acceptEncoding.slice(0, 20)}`;
  }
}
