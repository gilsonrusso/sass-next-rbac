import { FastifyInstance } from 'fastify'

import { authenticateWithGithub } from './authenticate-with-github'
import { authenticateWithPassword } from './authenticate-with-password'
import { createAccount } from './create-account'
import { getProfile } from './get-profile'
import { requestPasswordRecovery } from './request-password-recovery'
import { resetPassword } from './reset-password'

export async function authRoutes(app: FastifyInstance) {
  app.register(authenticateWithGithub)
  app.register(authenticateWithPassword)
  app.register(createAccount)
  app.register(getProfile)
  app.register(requestPasswordRecovery)
  app.register(resetPassword)
}
