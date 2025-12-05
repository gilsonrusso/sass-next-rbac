import { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { BadRequestError } from './routes/__errors/bad-request-error'
import { UnauthorizedError } from './routes/__errors/unauthorized-error'

export const errorHandler: FastifyInstance['errorHandler'] = (
  error,
  request,
  reply
) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      error: 'Response Validation Error',
      message: "Request doesn't match the schema",
      statusCode: 400,
      details: {
        issues: error.validation,
        method: request.method,
        url: request.url,
      },
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      error: 'Bad Request Error',
      message: error.message,
      statusCode: 400,
      details: {
        issues: error.message,
        method: request.method,
        url: request.url,
      },
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      error: 'Unauthorized Error',
      message: error.message,
      statusCode: 401,
      details: {
        issues: error.message,
        method: request.method,
        url: request.url,
      },
    })
  }

  console.error('>>>>>', error)

  //   send error to some observability platform here...

  return reply.status(500).send({
    message: 'Internal server error',
  })
}
