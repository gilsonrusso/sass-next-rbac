import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authMiddleware } from '@/http/middlewares/auth'
import { z } from 'zod'
import { prismaClient } from '@/lib/prisma'
import { RoleSchema } from '@repo/auth'

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/organization/:slug/membership',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Get membership of the organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().describe('The slug of the organization'),
          }),
          response: {
            200: z.object({
              membership: z.object({
                role: RoleSchema,
                userId: z.uuid().describe('The id of the user'),
                organizationId: z.uuid().describe('The id of the organization'),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { membership } = await request.getUserMembership(slug)

        return reply.status(200).send({
          membership: {
            role: membership.role,
            userId: membership.userId,
            organizationId: membership.organizationId,
          },
        })
      }
    )
}
