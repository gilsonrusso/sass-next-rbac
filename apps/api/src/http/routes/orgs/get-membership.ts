import { authMiddleware } from '@/http/middlewares/auth'
import { RoleSchema } from '@repo/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ORGANIZATION_SWAGGER_TAG } from '.'

const getMembershipParamsSchema = z.object({
  slug: z.string().describe('The slug of the organization'),
})

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/organization/:slug/membership',
      {
        schema: {
          tags: [ORGANIZATION_SWAGGER_TAG],
          summary: 'Get membership of the organization',
          security: [{ bearerAuth: [] }],
          params: getMembershipParamsSchema,
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
