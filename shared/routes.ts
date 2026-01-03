import { z } from 'zod';
import { insertShopSchema, insertProductSchema, insertTaskSchema, shops, products, tasks } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  shops: {
    list: {
      method: 'GET' as const,
      path: '/api/shops',
      input: z.object({
        category: z.enum(["tailor", "laundry", "retail", "service"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof shops.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/shops/:id',
      responses: {
        200: z.custom<typeof shops.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/shops',
      input: insertShopSchema,
      responses: {
        201: z.custom<typeof shops.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  products: {
    listByShop: {
      method: 'GET' as const,
      path: '/api/shops/:shopId/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/shops/:shopId/products',
      input: insertProductSchema.omit({ shopId: true }),
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id/status',
      input: z.object({ status: z.enum(["in_progress", "completed"]) }),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Type exports for API requests
export type CreateTaskRequest = z.infer<typeof insertTaskSchema>;
