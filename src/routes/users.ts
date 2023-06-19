import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', {}, async (req, res) => {
    const userBodySchema = z.object({
      name: z.string().nonempty(),
    })

    let userBody
    try {
      userBody = userBodySchema.parse(req.body)
    } catch (error) {
      return res.status(400).send(JSON.parse(String(error)))
    }

    const { name } = userBody

    let sessionId = req.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })

    res.status(201)
  })
}
