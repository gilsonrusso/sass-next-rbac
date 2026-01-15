import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { OrganizationValidationSchema } from '@repo/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../__errors/unauthorized-error'

const updateOrganizationBodySchema = z.object({
  name: z.string(),
  domain: z.string().nullish(),
  shouldAttachUserByDomain: z.boolean().optional(),
})

const updateOrganizationParamsSchema = z.object({
  slug: z.string().describe('The slug of the organization'),
})

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .put(
      '/organizations/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Update organization by slug',
          security: [{ bearerAuth: [] }],
          body: updateOrganizationBodySchema,
          params: updateOrganizationParamsSchema,
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
        const { name, domain, shouldAttachUserByDomain } = request.body

        const authOrganization =
          OrganizationValidationSchema.parse(organization)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            'You are not authorized to update this organization'
          )
        }

        if (domain) {
          const organizationByDomain =
            await prismaClient.organization.findFirst({
              where: {
                domain,
                id: {
                  not: organization.id,
                },
              },
            })

          if (organizationByDomain) {
            throw new UnauthorizedError('Domain already in use')
          }
        }

        await prismaClient.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            name,
            domain,
            shouldAttachUserByDomain,
          },
        })

        return reply.status(204).send()
      }
    )
}
