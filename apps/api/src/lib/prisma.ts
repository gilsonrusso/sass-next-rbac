import { env } from '@repo/env'
import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'

// export const prismaClient = new PrismaClient({
//   accelerateUrl: env.DATABASE_URL,
//   log: env.NODE_ENV === 'development' ? ['query'] : [],
// })

const connectionString = `${env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prismaClient = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['query'] : [],
})

export { prismaClient }
