import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import { RoleSchema } from '@repo/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function getOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/organizations',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Get organizations where the user is a member',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              organizations: z.array(
                z.object({
                  id: z.uuid().describe('The id of the organization'),
                  name: z.string().describe('The name of the organization'),
                  slug: z.string().describe('The slug of the organization'),
                  avatarUrl: z
                    .url()
                    .nullable()
                    .describe('The avatar url of the organization'),
                  role: RoleSchema,
                })
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId()

        const orgs = await prismaClient.organization.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            members: {
              select: {
                role: true,
              },
              where: {
                userId,
              },
            },
          },
          where: {
            members: {
              some: {
                userId,
              },
            },
          },
        })

        const orgsResponse = orgs.map(({ members, ...org }) => {
          return {
            ...org,
            role: members[0].role,
          }
        })

        return { organizations: orgsResponse }
      }
    )
}
