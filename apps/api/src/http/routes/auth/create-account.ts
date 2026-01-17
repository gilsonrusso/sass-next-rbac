import { prismaClient } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { AUTH_SWAGGER_TAG } from '.'
import { BadRequestError } from '../__errors/bad-request-error'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
})

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: [AUTH_SWAGGER_TAG],
        summary: 'Cria uma nova conta de usuário',
        body: createAccountBodySchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userExists = await prismaClient.user.findUnique({
        where: { email },
      })

      if (userExists) {
        throw new BadRequestError('Email already in use')
      }

      const [, domain] = email.split('@')
      const autoJoinOrganization = await prismaClient.organization.findFirst({
        where: {
          domain,
          shouldAttachUserByDomain: true,
        },
      })

      const passwordHash = await hash(password, 6)

      await prismaClient.user.create({
        data: {
          name,
          email,
          passwordHash,
          members_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                },
              }
            : undefined,
        },
      })

      return reply.status(201).send()
    }
  )
}
