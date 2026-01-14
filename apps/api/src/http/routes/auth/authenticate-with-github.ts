import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../__errors/bad-request-error'
import { prismaClient } from '@/lib/prisma'
import { env } from '@repo/env'

export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/github',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate user with GitHub OAuth',
        body: z.object({
          code: z.string().describe('The GitHub OAuth code'),
        }),
        response: {
          201: z.object({
            token: z.string().describe('The JWT token for authenticated user'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const githubOauthURL = new URL(
        'https://github.com/login/oauth/access_token'
      )
      githubOauthURL.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
      githubOauthURL.searchParams.set(
        'client_secret',
        env.GITHUB_OAUTH_CLIENT_SECRET
      )
      githubOauthURL.searchParams.set(
        'redirect_uri',
        env.GITHUB_OAUTH_CLIENT_REDIRECT_URI
      )
      githubOauthURL.searchParams.set('code', code)

      const githubAcessTokenResponse = await fetch(githubOauthURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })

      const githubAcessTokenData = await githubAcessTokenResponse.json()

      const { access_token: githubAccessToken } = z
        .object({
          access_token: z.string(),
          token_type: z.literal('bearer'),
          scope: z.string(),
        })
        .parse(githubAcessTokenData)

      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
        },
      })

      const githubUserData = await userResponse.json()

      console.log(githubUserData)

      const {
        id: githubId,
        name,
        email,
        avatar_url: avatarUrl,
      } = z
        .object({
          id: z
            .number()
            .int()
            .transform((id) => id.toString()),
          avatar_url: z.url(),
          name: z.string().nullable(),
          email: z.string().nullable(),
        })
        .parse(githubUserData)

      if (!email) {
        throw new BadRequestError('Email not provided by GitHub')
      }

      let user = await prismaClient.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        user = await prismaClient.user.create({
          data: {
            name,
            email,
            avatarUrl,
          },
        })
      }

      let account = await prismaClient.account.findUnique({
        where: {
          provider_userId: {
            provider: 'GITHUB',
            userId: user.id,
          },
        },
      })

      if (!account) {
        account = await prismaClient.account.create({
          data: {
            userId: user.id,
            provider: 'GITHUB',
            providerAccountId: githubId,
          },
        })
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        { sign: { expiresIn: '7d' } }
      )

      return reply.status(201).send({ token })
    }
  )
}
