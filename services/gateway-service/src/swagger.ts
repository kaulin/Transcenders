import { FastifyInstance } from 'fastify';
import Swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';
import { SERVICE_URLS } from './urls';

async function fetchSpec(serviceUrl: string) {
  const res = await fetch(`${serviceUrl}/docs/json`);
  if (!res.ok) {
    console.warn(`Failed to fetch spec from ${serviceUrl}`);
    return null;
  }
  return res.json();
}

export async function setupGatewaySwagger(fastify: FastifyInstance) {
  const [authSpec, userSpec, scoreSpec] = await Promise.all([
    fetchSpec(SERVICE_URLS.AUTH),
    fetchSpec(SERVICE_URLS.USER),
    fetchSpec(SERVICE_URLS.SCORE),
  ]);

  const mergedSpec = {
    openapi: '3.0.0',
    info: { title: 'Gateway API', version: '1.0.0' },
    paths: {
      ...(authSpec?.paths || {}),
      ...(userSpec?.paths || {}),
      ...(scoreSpec?.paths || {}),
    },
    components: {
      schemas: {
        ...(authSpec?.components?.schemas || {}),
        ...(userSpec?.components?.schemas || {}),
        ...(scoreSpec?.components?.schemas || {}),
      },
    },
  };

  await fastify.register(Swagger, {
    mode: 'static',
    specification: {
      document: mergedSpec,
    },
  });

  await fastify.register(SwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}