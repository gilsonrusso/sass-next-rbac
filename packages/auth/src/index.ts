import {
  AbilityBuilder,
  AbilityTuple,
  CreateAbility,
  createMongoAbility,
  detectSubjectType,
  MongoAbility,
} from '@casl/ability'
import { z } from 'zod'
import { User } from './models/user'
import { PERMISSIONS } from './permissions'
import { BillingSubjectSchema } from './subjects/billing'
import { InviteSubjectSchema } from './subjects/invite'
import { OrganizationSubjectSchema } from './subjects/organization'
import { ProjectSubjectSchema } from './subjects/projects'
import { UserSubjectSchema } from './subjects/user'

export * from './models/user'
export * from './models/project'
export * from './models/organization'

const AppAbilitiesSchema = z.union([
  UserSubjectSchema,
  ProjectSubjectSchema,
  OrganizationSubjectSchema,
  InviteSubjectSchema,
  BillingSubjectSchema,
  z.tuple([z.literal('manage'), z.literal('All')]),
])

type AppAbilities = AbilityTuple<
  z.infer<typeof AppAbilitiesSchema>[0],
  z.infer<typeof AppAbilitiesSchema>[1]
>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder<AppAbility>(createAppAbility)

  if (typeof PERMISSIONS[user.role] !== 'function') {
    throw new Error(`No permissions defined for role: ${user.role}`)
  }

  PERMISSIONS[user.role](user, builder)

  return builder.build({
    detectSubjectType: (item) => {
      return item.__typeName
    },
  })
}
