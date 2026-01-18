import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { ProjectValidationSchema } from '@repo/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { PROJECT_SWAGGER_TAG } from '.'
import { BadRequestError } from '../__errors/bad-request-error'
import { UnauthorizedError } from '../__errors/unauthorized-error'

const deleteProjectParamsSchema = z.object({
  slug: z.string().describe('The slug of the organization'),
  projectId: z.string().describe('The id of the project'),
})

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      '/organization/:slug/projects/:projectId',
      {
        schema: {
          tags: [PROJECT_SWAGGER_TAG],
          summary: 'Delete a project',
          security: [{ bearerAuth: [] }],
          params: deleteProjectParamsSchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug, projectId } = request.params
        const { membership, organization } =
          await request.getUserMembership(slug)

        const project = await prismaClient.project.findUnique({
          where: {
            id: projectId,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        const { cannot } = getUserPermissions(userId, membership.role)
        const authProject = ProjectValidationSchema.parse(project)

        if (cannot('delete', authProject)) {
          throw new UnauthorizedError(
            'You do not have permission to delete this project'
          )
        }

        await prismaClient.project.delete({
          where: {
            id: projectId,
          },
        })

        return reply.status(204).send()
      }
    )
}
