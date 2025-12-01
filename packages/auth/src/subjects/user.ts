import { z } from 'zod'

export const UserSubjectSchema = z.tuple([
  z.union([
    z.literal('create'),
    z.literal('delete'),
    z.literal('invite'),
    z.literal('manage'),
  ]),
  z.literal('User'),
])

export type UserSubject = z.infer<typeof UserSubjectSchema>
