import { faker } from '@faker-js/faker'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { env } from '../src/env/index.ts'
import { PrismaClient } from '../src/generated/prisma/client.ts'

const connectionString = `${env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prismaClient = new PrismaClient({
  adapter,
})

async function seed() {
  await prismaClient.organization.deleteMany()
  await prismaClient.user.deleteMany()

  const users = await Promise.all([
    prismaClient.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: await hash('password123', 1),
      },
    }),
    prismaClient.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: await hash('password123', 1),
      },
    }),
    prismaClient.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: await hash('password123', 1),
      },
    }),
  ])

  const [firstUser, secondUser, thirdUser] = users

  await prismaClient.organization.create({
    data: {
      name: 'Acme Corp (ADMIN)',
      domain: 'acme.com',
      slug: faker.helpers.slugify(faker.company.name() + '-admin'),
      avatarUrl: faker.image.url(),
      shouldAttachUserByDomain: true,
      ownerId: firstUser.id,
      projects: {
        createMany: {
          data: Array.from({ length: 3 }).map(() => ({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            slug: faker.helpers.slugify(
              faker.commerce.productName() + '-' + faker.string.uuid()
            ),
            avatarUrl: faker.image.url(),
            ownerId: faker.helpers.arrayElement([
              firstUser.id,
              secondUser.id,
              thirdUser.id,
            ]),
          })),
        },
      },
      members: {
        create: [
          { userId: firstUser.id, role: 'ADMIN' },
          { userId: secondUser.id, role: 'MEMBER' },
          { userId: thirdUser.id, role: 'MEMBER' },
        ],
      },
    },
  })

  await prismaClient.organization.create({
    data: {
      name: 'Acme Corp (MEMBER)',
      slug: faker.helpers.slugify(faker.company.name() + '-member'),
      avatarUrl: faker.image.url(),
      ownerId: firstUser.id,
      projects: {
        createMany: {
          data: Array.from({ length: 3 }).map(() => ({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            slug: faker.helpers.slugify(
              faker.commerce.productName() + '-' + faker.string.uuid()
            ),
            avatarUrl: faker.image.url(),
            ownerId: faker.helpers.arrayElement([
              firstUser.id,
              secondUser.id,
              thirdUser.id,
            ]),
          })),
        },
      },
      members: {
        create: [
          { userId: firstUser.id, role: 'MEMBER' },
          { userId: secondUser.id, role: 'ADMIN' },
          { userId: thirdUser.id, role: 'MEMBER' },
        ],
      },
    },
  })

  await prismaClient.organization.create({
    data: {
      name: 'Acme Corp (Billing)',
      slug: faker.helpers.slugify(faker.company.name() + '-billing'),
      avatarUrl: faker.image.url(),
      ownerId: firstUser.id,
      projects: {
        createMany: {
          data: Array.from({ length: 3 }).map(() => ({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            slug: faker.helpers.slugify(
              faker.commerce.productName() + '-' + faker.string.uuid()
            ),
            avatarUrl: faker.image.url(),
            ownerId: faker.helpers.arrayElement([
              firstUser.id,
              secondUser.id,
              thirdUser.id,
            ]),
          })),
        },
      },
      members: {
        create: [
          { userId: firstUser.id, role: 'BILLING' },
          { userId: secondUser.id, role: 'ADMIN' },
          { userId: thirdUser.id, role: 'MEMBER' },
        ],
      },
    },
  })
}

seed().then(async () => {
  console.log('Seeding finished.')
  await prismaClient.$disconnect()
})
