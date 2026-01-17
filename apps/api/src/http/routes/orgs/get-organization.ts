import { authMiddleware } from '@/http/middlewares/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ORGANIZATION_SWAGGER_TAG } from '.'

const getOrganizationParamsSchema = z.object({
  slug: z.string().describe('The slug of the organization'),
})

export async function getOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/organizations/:slug',
      {
        schema: {
          tags: [ORGANIZATION_SWAGGER_TAG],
          summary: 'Get organization by slug',
          security: [{ bearerAuth: [] }],
          params: getOrganizationParamsSchema,
          response: {
            200: z.object({
              organization: z.object({
                id: z.uuid().describe('The id of the organization'),
                name: z.string().describe('The name of the organization'),
                slug: z.string().describe('The slug of the organization'),
                domain: z
                  .string()
                  .nullable()
                  .describe('The domain of the organization'),
                shouldAttachUserByDomain: z
                  .boolean()
                  .describe(
                    'The should attach user by domain of the organization'
                  ),
                avatarUrl: z
                  .url()
                  .nullable()
                  .describe('The avatar url of the organization'),
                ownerId: z
                  .uuid()
                  .describe('The id of the owner of the organization'),
                createdAt: z
                  .date()
                  .describe('The creation date of the organization'),
                updatedAt: z
                  .date()
                  .describe('The update date of the organization'),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)

        return { organization }
      }
    )
}
