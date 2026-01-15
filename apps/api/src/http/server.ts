import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@repo/env'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { authRoutes } from './routes/auth/index'
import { orgsRoutes } from './routes/orgs/index'

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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT obtained from /auth/login',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

// JWT
app.register(fastifyJwt, {
  secret: env.JWT_SECRET ?? 'default_secret',
})

// Health check
app.get('/health', (_, reply) => {
  return reply.status(200).send({ message: 'API OK' })
})

// Routes
app.register(authRoutes)
app.register(orgsRoutes)

// Server start
app
  .listen({ port: env.SERVER_PORT })
  .then((address) => {
    console.log(`Server listening at ${address}`)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
export { app }
