/*
 * Build a path from route and dynamic params.
 * Include multiple params as an object.
 */

export function buildPath(pathTemplate: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce((path, [key, value]) => {
    return path.replace(`:${key}`, encodeURIComponent(value.toString()));
  }, pathTemplate);
}

// TODO Implement in all gateway controllers to get rid of manual path building and centralize route definitions
