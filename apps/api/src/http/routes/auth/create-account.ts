import { prismaClient } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

const authenticateBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
})

const AUTH_TAG = 'Autenticação'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: [AUTH_TAG],
        summary: 'Cria uma nova conta de usuário',
        body: authenticateBodySchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userExists = await prismaClient.user.findUnique({
        where: { email },
      })

      if (userExists) {
        return reply.status(409).send({ message: 'Email already in use' })
      }

      const passwordHash = await hash(password, 6)

      await prismaClient.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      })

      return reply.status(201).send()
    }
  )
}
