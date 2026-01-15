import { z } from 'zod'

export const OrganizationValidationSchema = z.object({
  __typeName: z.literal('Organization').default('Organization'),
  id: z.string(),
  ownerId: z.string(),
})

export type Organization = z.infer<typeof OrganizationValidationSchema>
