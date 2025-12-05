import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { createAccount } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { env } from '../env/index'

const app = fastify().withTypeProvider<ZodTypeProvider>()

// CORS
app.register(fastifyCors, {
  origin: '*',
})

// Zod validator/serializer compilers
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

// GLOBAL ERROR HANDLER
app.setErrorHandler(errorHandler)

// Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next Saas API',
      description: 'Full Stack Saas app with multi-tenant & RBAC',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

// JWT
app.register(fastifyJwt, {
  secret: env.SECRET_KEY ?? 'default_secret',
})

// Health check
app.get('/health', (_, reply) => {
  return reply.status(200).send({ message: 'API OK' })
})

// Routes
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)

// Server start
app
  .listen({ port: 3000, host: '0.0.0.0' })
  .then((address) => {
    console.log(`Server listening at ${address}`)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
export { app }
