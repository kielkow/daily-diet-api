import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { knex } from './database'
import { logRequest } from './middleware/log-request'

export const app = fastify()

app.register(cookie)

app.addHook('preHandler', logRequest)

app.get('/status', () => {
  return 'server is running'
})

app.get('/status-database', () => {
  return knex('sqlite_schema').select('*')
})
