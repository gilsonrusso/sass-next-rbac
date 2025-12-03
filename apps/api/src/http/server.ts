import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import {
  jsonSchemaTransform,
  //   jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createAccount } from './routes/auth/create-account'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next Saas API',
      description: 'Full Stack Saas app with muilt-tenant & RBAC',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.get('/health', (_, replay) => {
  return replay.status(200).send({ message: 'API OK' })
})
app.register(createAccount)

app.listen({ port: 3000 }, (err, address) => {
  console.log(`Server listening at ${address}`)
})
