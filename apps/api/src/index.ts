import { defineAbilityFor, ProjectSchema } from '@repo/auth'

const ability = defineAbilityFor({ role: 'MEMBER', id: 'user-123' })

const project = ProjectSchema.parse({
  id: 'project-456',
  ownerId: 'user-1234',
})

const userCanInviteSomeoneElse = ability.can('create', 'Invite')
const useCanDeleteUser = ability.can('delete', 'User')
const useCannotDeleteUser = ability.cannot('delete', 'User')
const userCannotBilling = ability.cannot('get', 'Billing')
const userCanDeleteOwnProject = ability.can('delete', project)

// console.log('User can invite someone else:', userCanInviteSomeoneElse)
// console.log('User can delete another user:', useCanDeleteUser)
// console.log('User cannot delete another user:', useCannotDeleteUser)
// console.log('User cannot access billing:', userCannotBilling)
console.log('User can delete own project:', userCanDeleteOwnProject)

console.log('API is running')
