import { DeviceInfo, RefreshToken } from '@transcenders/contracts';
import { FastifyRequest } from 'fastify';

export class DeviceUtils {
  static extractDeviceInfo(request: FastifyRequest): DeviceInfo {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip || request.socket.remoteAddress,
      deviceFingerprint: this.generateDeviceFingerprint(request),
    };
  }

  private static generateDeviceFingerprint(request: FastifyRequest): string {
    const userAgent = request.headers['user-agent'] ?? 'unknown';
    const acceptLanguage = request.headers['accept-language'] ?? '';
    const acceptEncoding = request.headers['accept-encoding'] ?? '';
    const secChUa = request.headers['sec-ch-ua'] ?? '';

    // Extract more accurate browser info from Client Hints
    const browserInfo = this.extractBrowserFromClientHints(secChUa.toString(), userAgent);
    const os = this.extractOS(userAgent);
    const architecture = this.extractArchitecture(userAgent);

    return `${browserInfo}-${os}-${architecture}-${acceptLanguage.slice(0, 20)}-${acceptEncoding.slice(0, 20)}`;
  }

  private static extractBrowserFromClientHints(secChUa: string, userAgent: string): string {
    if (secChUa) {
      // Parse sec-ch-ua for accurate browser detection
      if (secChUa.includes('"Google Chrome"')) return 'Chrome';
      if (secChUa.includes('"Microsoft Edge"')) return 'Edge';
      if (secChUa.includes('"Firefox"')) return 'Firefox';
      if (secChUa.includes('"Safari"')) return 'Safari';
      if (secChUa.includes('"Opera"')) return 'Opera';
      if (secChUa.includes('"Brave"')) return 'Brave';
    }

    // Fallback to User-Agent parsing
    const browserMatch = /(Chrome|Firefox|Safari|Edge|Opera)/.exec(userAgent);
    return browserMatch?.[1] ?? 'unknown';
  }

  private static extractOS(userAgent: string): string {
    if (userAgent.includes('Windows NT 10.0')) return 'Windows10';
    if (userAgent.includes('Windows NT 6.3')) return 'Windows8.1';
    if (userAgent.includes('Windows NT 6.1')) return 'Windows7';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS X')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'unknown';
  }

  private static extractArchitecture(userAgent: string): string {
    if (userAgent.includes('x64') || userAgent.includes('x86_64')) return 'x64';
    if (userAgent.includes('ARM64') || userAgent.includes('aarch64')) return 'ARM64';
    if (userAgent.includes('ARM')) return 'ARM';
    if (userAgent.includes('x86')) return 'x86';
    return 'unknown';
  }

  static isSameDeviceAndLocation(stored: DeviceInfo, current: DeviceInfo): boolean {
    return (
      stored.deviceFingerprint === current.deviceFingerprint &&
      stored.ipAddress === current.ipAddress
    );
  }

  static isSameDevice(stored: DeviceInfo, current: DeviceInfo): boolean {
    return stored.deviceFingerprint === current.deviceFingerprint;
  }

  /**
   * Convert DeviceInfo from database values
   */
  static fromDatabaseValues(tokenEntry: RefreshToken): DeviceInfo {
    return {
      userAgent: tokenEntry.user_agent,
      ipAddress: tokenEntry.ip_address,
      deviceFingerprint: tokenEntry.device_fingerprint,
    };
  }
}
