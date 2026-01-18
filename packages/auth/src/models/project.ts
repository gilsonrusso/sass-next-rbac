import { z } from 'zod'

export const ProjectValidationSchema = z.object({
  __typeName: z.literal('Project').default('Project'),
  id: z.string(),
  ownerId: z.string(),
})

export type Project = z.infer<typeof ProjectValidationSchema>
