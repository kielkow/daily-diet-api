import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const mealBodySchema = z.object({
      name: z.string().nonempty(),
      description: z.string().nonempty(),
      date: z.string().nonempty(),
      respect_diet: z.boolean(),
    })

    let mealBody
    try {
      mealBody = mealBodySchema.parse(req.body)
    } catch (error) {
      return res.status(400).send(JSON.parse(String(error)))
    }

    const { name, description, date, respect_diet: respectDiet } = mealBody

    const user = await knex('users')
      .select('*')
      .where({ session_id: req.cookies.sessionId })
      .first()

    if (!user) {
      return res.status(400).send('user with this session_id not found')
    }

    await knex('meals').insert({
      id: randomUUID(),
      user_id: user.id,
      name,
      description,
      date,
      respect_diet: respectDiet,
    })

    res.status(201)
  })
}
