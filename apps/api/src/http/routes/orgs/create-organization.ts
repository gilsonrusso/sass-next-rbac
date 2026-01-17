import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import { createSlug } from '@/utils/create-slug'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ORGANIZATION_SWAGGER_TAG } from '.'
import { BadRequestError } from '../__errors/bad-request-error'

const createOrganizationBodySchema = z.object({
  name: z.string().describe('The name of the organization'),
  domain: z.string().nullish().describe('The domain of the organization'),
  shouldAttachUserByDomain: z
    .boolean()
    .optional()
    .describe('Should attach the user to the organization by domain'),
})

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/organizations',
      {
        schema: {
          tags: [ORGANIZATION_SWAGGER_TAG],
          summary: 'Create a new organization',
          security: [{ bearerAuth: [] }],
          body: createOrganizationBodySchema,
          response: {
            201: z.object({
              organizationId: z
                .uuid()
                .describe('The unique identifier of the organization'),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { name, domain, shouldAttachUserByDomain } = request.body

        if (domain) {
          const orgWithDomain = await prismaClient.organization.findUnique({
            where: {
              domain,
            },
          })
          if (orgWithDomain) {
            throw new BadRequestError(
              'Another organization with this domain already exists'
            )
          }
        }
        const org = await prismaClient.organization.create({
          data: {
            name,
            slug: createSlug(name),
            domain,
            shouldAttachUserByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        })

        return { organizationId: org.id }
      }
    )
}
