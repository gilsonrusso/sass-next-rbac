import { Role } from '@/generated/prisma/enums'
import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { OrganizationValidationSchema } from '@repo/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ORGANIZATION_SWAGGER_TAG } from '.'
import { BadRequestError } from '../__errors/bad-request-error'
import { UnauthorizedError } from '../__errors/unauthorized-error'

const transferOrganizationBodySchema = z.object({
  transferToUserId: z
    .string()
    .describe('The id of the user to transfer the organization to'),
})

const transferOrganizationParamsSchema = z.object({
  slug: z.string().describe('The slug of the organization'),
})

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .patch(
      '/organizations/:slug/owner',
      {
        schema: {
          tags: [ORGANIZATION_SWAGGER_TAG],
          summary: 'Transfer organization ownership',
          security: [{ bearerAuth: [] }],
          body: transferOrganizationBodySchema,
          params: transferOrganizationParamsSchema,
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

        if (cannot('transfer_ownership', authOrganization)) {
          throw new UnauthorizedError(
            'You are not authorized to transfer this organization ownership'
          )
        }
        const { transferToUserId } = request.body

        const transferToMembership = await prismaClient.member.findUnique({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserId,
            },
          },
        })

        if (!transferToMembership) {
          throw new BadRequestError(
            `Target user is not a member of this organization`
          )
        }

        await prismaClient.$transaction([
          prismaClient.member.update({
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: Role.ADMIN,
            },
          }),
          prismaClient.organization.update({
            where: {
              id: organization.id,
            },
            data: {
              ownerId: transferToUserId,
            },
          }),
        ])

        return reply.status(204).send()
      }
    )
}
