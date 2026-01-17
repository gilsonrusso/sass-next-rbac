import { authMiddleware } from '@/http/middlewares/auth'
import { prismaClient } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { AUTH_SWAGGER_TAG } from '.'

const requestPasswordRecoveryBodySchema = z.object({
  email: z.email().describe('The email of the user'),
})

export async function requestPasswordRecovery(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/password/recovery',
      {
        schema: {
          tags: [AUTH_SWAGGER_TAG],
          summary: 'Request password recovery for a user',
          body: requestPasswordRecoveryBodySchema,
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { email } = request.body

        const user = await prismaClient.user.findUnique({
          where: { email },
        })

        if (!user) {
          // we don't reveal that the user does not exist
          return reply.status(201).send()
        }

        const { id: code } = await prismaClient.token.create({
          data: {
            type: 'PASSWORD_RECOVERY',
            userId: user.id,
          },
        })

        console.log(`Password recovery token for user ${email}: ${code}`)

        return reply.status(201).send()
      }
    )
}
