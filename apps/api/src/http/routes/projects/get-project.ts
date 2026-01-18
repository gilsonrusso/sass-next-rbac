import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { PROJECT_SWAGGER_TAG } from '.'
import { BadRequestError } from '../__errors/bad-request-error'
import { UnauthorizedError } from '../__errors/unauthorized-error'

const getProjectParamsSchema = z.object({
  orgSlug: z.string().describe('The slug of the organization'),
  projectSlug: z.string().describe('The slug of the project'),
})

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/organizations/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: [PROJECT_SWAGGER_TAG],
          summary: 'Get project by id',
          security: [{ bearerAuth: [] }],
          params: getProjectParamsSchema,
          response: {
            200: z.object({
              project: z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                description: z.string().nullish(),
                avatarUrl: z.string().nullish(),
                organizationId: z.string(),
                owner: z.object({
                  id: z.string(),
                  name: z.string().nullable(),
                  avatarUrl: z.string().nullish(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { orgSlug, projectSlug } = request.params
        const { membership, organization } =
          await request.getUserMembership(orgSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError(
            'You do not have permission to read this project'
          )
        }

        const project = await prismaClient.project.findUnique({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            avatarUrl: true,
            organizationId: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        return reply.status(200).send({ project })
      }
    )
}
