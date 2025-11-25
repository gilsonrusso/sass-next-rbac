import { defineAbilityFor } from '@repo/auth'

const ability = defineAbilityFor({ role: 'ADMIN' })

const userCanInviteSomeoneElse = ability.can('invite', 'User')
const useCanDeleteUser = ability.can('delete', 'User')
const useCannotDeleteUser = ability.cannot('delete', 'User')

console.log('User can invite someone else:', userCanInviteSomeoneElse)
console.log('User can delete another user:', useCanDeleteUser)
console.log('User cannot delete another user:', useCannotDeleteUser)

console.log('API is running')
