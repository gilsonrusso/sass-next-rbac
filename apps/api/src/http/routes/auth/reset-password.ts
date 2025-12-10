import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../__errors/unauthorized-error'
import { hash } from 'bcryptjs'

export async function resetPassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/password/reset',
      {
        schema: {
          tags: ['auth'],
          summary: 'Reset user password using recovery code',
          body: z.object({
            code: z.uuid().describe('The password recovery code'),
            password: z.string().min(6).describe('The new password'),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { code, password } = request.body

        const tokenFromCode = await prismaClient.token.findUnique({
          where: { id: code },
        })

        if (!tokenFromCode) {
          // we don't reveal that the user does not exist
          throw new UnauthorizedError()
        }

        const passwordHash = await hash(password, 6)

        await prismaClient.user.update({
          where: { id: tokenFromCode.userId },
          data: { passwordHash },
        })

        return reply.status(204).send()
      }
    )
}
