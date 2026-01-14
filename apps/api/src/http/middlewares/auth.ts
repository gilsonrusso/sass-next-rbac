import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { UnauthorizedError } from '../routes/__errors/unauthorized-error'
import { prismaClient } from '@/lib/prisma'

export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        return sub
      } catch {
        throw new UnauthorizedError('Invalid authentication token')
      }
    }
    request.getUserMembership = async (organizationSlug: string) => {
      const userId = await request.getCurrentUserId()
      const userMembership = await prismaClient.member.findFirst({
        where: {
          userId,
          organization: {
            slug: organizationSlug,
          },
        },
        include: {
          organization: true,
        },
      })

      if (!userMembership) {
        throw new UnauthorizedError('User is not a member of this organization')
      }

      const { organization, ...membership } = userMembership

      return {
        organization,
        membership,
      }
    }
  })
})
