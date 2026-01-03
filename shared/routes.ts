import { z } from 'zod';
import { insertComplaintSchema, complaints, COMPLAINT_STATUS } from './schema';

export const api = {
  complaints: {
    create: {
      method: 'POST' as const,
      path: '/api/complaints',
      input: insertComplaintSchema,
      responses: {
        200: z.custom<typeof complaints.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/complaints',
      responses: {
        200: z.array(z.custom<typeof complaints.$inferSelect>()),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/complaints/:id/status',
      input: z.object({
        status: z.enum(COMPLAINT_STATUS),
      }),
      responses: {
        200: z.custom<typeof complaints.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
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
