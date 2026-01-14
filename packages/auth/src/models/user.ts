import { z } from 'zod'
import { RoleSchema } from '../roles'

export const UserSchema = z.object({
  id: z.string(),
  role: RoleSchema,
})

export type User = z.infer<typeof UserSchema>
