import {
  createMongoAbility,
  ForcedSubject,
  CreateAbility,
  MongoAbility,
  AbilityBuilder,
} from '@casl/ability'
import { User } from './models/user'
import { PERMISSIONS } from './permissions'

const actions = ['manage', 'invite', 'delete'] as const
const subjects = ['User', 'all'] as const

type AppAbilities = [
  (typeof actions)[number],
  (
    | (typeof subjects)[number]
    | ForcedSubject<Exclude<(typeof subjects)[number], 'all'>>
  ),
]

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder<AppAbility>(createAppAbility)

  if (typeof PERMISSIONS[user.role] !== 'function') {
    throw new Error(`No permissions defined for role: ${user.role}`)
  }

  PERMISSIONS[user.role](user, builder)

  return builder.build()
}
