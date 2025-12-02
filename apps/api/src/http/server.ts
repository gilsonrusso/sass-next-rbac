import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import {
  //   jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createAccount } from './routes/auth/create-account'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
// app.addSchemaTransform(jsonSchemaTransform)

app.get('/health', (_, replay) => {
  return replay.status(200).send({ message: 'API OK' })
})
app.register(createAccount)

app.listen({ port: 3000 }, (err, address) => {
  console.log(`Server listening at ${address}`)
})
