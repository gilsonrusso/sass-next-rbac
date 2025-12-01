import { z } from 'zod'
import { ProjectSchema } from '../models/project'

export const ProjectSubjectSchema = z.tuple([
  z.union([z.literal('create'), z.literal('delete'), z.literal('manage')]),
  z.union([z.literal('Project'), ProjectSchema]),
])

export type ProjectSubject = z.infer<typeof ProjectSubjectSchema>
