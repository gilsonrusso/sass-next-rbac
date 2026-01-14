import 'fastify'
import { Organization } from '@/prisma/schema'
import { Member } from '@/prisma/schema'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(organizationSlug: string): Promise<{
      organization: Organization
      membership: Member
    }>
  }
}
