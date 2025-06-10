export interface ServerConfig {
  port?: number;
  host?: string;
  title: string;
  description: string;
  version?: string;
  routePrefix?: string;
}

export interface SwaggerConfig {
  routePrefix?: string;
  staticCSP?: boolean;
  transformStaticCSP?: (header: string) => string;
}
