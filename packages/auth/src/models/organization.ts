import { z } from 'zod'

export const OrganizationSchema = z.object({
  __typeName: z.literal('Project').default('Project'),
  id: z.string(),
  ownerId: z.string(),
})

export type Organization = z.infer<typeof OrganizationSchema>
