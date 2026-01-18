import type { FastifyInstance } from 'fastify'
import { createProject } from './create-project'
import { deleteProject } from './delete-project'
import { getProject } from './get-project'

export const PROJECT_SWAGGER_TAG = 'projects'

export async function projectsRoutes(app: FastifyInstance) {
  app.register(createProject)
  app.register(deleteProject)
  app.register(getProject)
}
