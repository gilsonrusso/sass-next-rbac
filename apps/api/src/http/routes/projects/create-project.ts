import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { PROJECT_SWAGGER_TAG } from '.'
import { BadRequestError } from '../__errors/bad-request-error'
import { UnauthorizedError } from '../__errors/unauthorized-error'

const createProjectBodySchema = z.object({
  name: z.string().describe('The name of the project'),
  description: z.string().nullish().describe('The description of the project'),
})

const createProjectParamsSchema = z.object({
  slug: z.string().describe('The slug of the organization'),
})

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/organizations/:slug/projects',
      {
        schema: {
          tags: [PROJECT_SWAGGER_TAG],
          summary: 'Create a new project',
          security: [{ bearerAuth: [] }],
          body: createProjectBodySchema,
          params: createProjectParamsSchema,
          response: {
            201: z.object({
              projectId: z
                .uuid()
                .describe('The unique identifier of the project'),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Project')) {
          throw new UnauthorizedError(
            'You do not have permission to create a project'
          )
        }

        const { name, description } = request.body

        const projectWithSameName = await prismaClient.project.findFirst({
          where: {
            name,
            organizationId: organization.id,
          },
        })

        if (projectWithSameName) {
          throw new BadRequestError(
            'Another project with this name already exists'
          )
        }

        const project = await prismaClient.project.create({
          data: {
            name,
            slug: createSlug(name),
            description,
            organizationId: organization.id,
            ownerId: userId,
          },
        })

        return reply.status(201).send({
          projectId: project.id,
        })
      }
    )
}
