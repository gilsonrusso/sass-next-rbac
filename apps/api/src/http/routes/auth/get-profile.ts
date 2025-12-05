import { prismaClient } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../__errors/bad-request-error'

export async function getProfile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/profile',
    {
      schema: {
        tags: ['auth'],
        summary: 'Get the profile of the authenticated user',
        response: {
          200: z.object({
            user: z.object({
              id: z.uuid().describe('The unique identifier of the user'),
              email: z.email().describe('The email of the user'),
              name: z.string().nullable().describe('The name of the user'),
              avatarUrl: z
                .url()
                .nullable()
                .describe('The URL of the user avatar'),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { sub } = await request.jwtVerify<{ sub: string }>()
      const user = await prismaClient.user.findUnique({
        where: { id: sub },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      })

      if (!user) {
        throw new BadRequestError('User not found')
      }

      return reply.status(200).send({ user })
    }
  )
}
