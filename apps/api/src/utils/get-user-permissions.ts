import { defineAbilityFor, UserValidationSchema, type Role } from '@repo/auth'

export function getUserPermissions(userId: string, role: Role) {
  const authUser = UserValidationSchema.parse({
    id: userId,
    role: role,
  })

  const ability = defineAbilityFor(authUser)

  return ability
}
