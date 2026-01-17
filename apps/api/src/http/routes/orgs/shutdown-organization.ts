import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { OrganizationValidationSchema } from '@repo/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ORGANIZATION_SWAGGER_TAG } from '.'
import { UnauthorizedError } from '../__errors/unauthorized-error'

const shutdownOrganizationParamsSchema = z.object({
  slug: z.string().describe('The slug of the organization'),
})

export async function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      '/organizations/:slug',
      {
        schema: {
          tags: [ORGANIZATION_SWAGGER_TAG],
          summary: 'Shutdown organization by slug',
          security: [{ bearerAuth: [] }],
          params: shutdownOrganizationParamsSchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const authOrganization =
          OrganizationValidationSchema.parse(organization)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', authOrganization)) {
          throw new UnauthorizedError(
            'You are not authorized to shutdown this organization'
          )
        }

        await prismaClient.organization.delete({
          where: {
            id: organization.id,
          },
        })

        return reply.status(204).send()
      }
    )
}
