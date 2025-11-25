import { AbilityBuilder } from '@casl/ability'
import { AppAbility } from '.'
import { User } from './models/user'

type Role = 'ADMIN' | 'MEMBER'

type PermissionByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void

export const PERMISSIONS: Record<Role, PermissionByRole> = {
  ADMIN(_, { can }) {
    can('manage', 'all')
  },
  MEMBER(_, { can }) {
    can('invite', 'User')
  },
}
