import { z } from 'zod'
import { ProjectValidationSchema } from '../models/project'

export const ProjectSubjectSchema = z.tuple([
  z.union([z.literal('create'), z.literal('delete'), z.literal('manage')]),
  z.union([z.literal('Project'), ProjectValidationSchema]),
])

export type ProjectSubject = z.infer<typeof ProjectSubjectSchema>
