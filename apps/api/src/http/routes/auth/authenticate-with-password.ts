import { prismaClient } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../__errors/bad-request-error'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate user with email and password',
        body: z.object({
          email: z.email().describe('The email of the user'),
          password: z.string().describe('The password of the user'),
        }),
        response: {
          201: z.object({
            token: z.string().describe('The JWT token for authenticated user'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const userFromEmail = await prismaClient.user.findUnique({
        where: { email },
      })

      if (!userFromEmail) {
        throw new BadRequestError('Invalid credentials.')
      }

      if (userFromEmail.passwordHash === null) {
        throw new BadRequestError(
          'User does not hava a password, use social login.'
        )
      }

      const isPasswordCorrect = await compare(
        password,
        userFromEmail.passwordHash
      )

      if (!isPasswordCorrect) {
        throw new BadRequestError('Invalid credentials.')
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        { sign: { expiresIn: '7d' } }
      )

      return reply.status(201).send({ token })
    }
  )
}
