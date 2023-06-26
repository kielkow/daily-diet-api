import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

interface IMealQueryString {
  name: string
  description: string
  date: string
  respect_diet: boolean
}

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

  app.get<{ Querystring: IMealQueryString }>(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const user = await knex('users')
        .select('*')
        .where({ session_id: req.cookies.sessionId })
        .first()

      if (!user) {
        return res.status(400).send('user with this session_id not found')
      }

      const options = {
        ...req.query,
        user_id: user.id,
      }

      const meals = await knex('meals').select('*').where(options)

      res.send(meals)
    },
  )

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const paramSchema = z.object({ id: z.string().uuid() })

    let id: string
    try {
      const params = paramSchema.parse(req.params)
      id = params.id
    } catch (error) {
      return res.status(400).send(JSON.parse(String(error)))
    }

    const user = await knex('users')
      .select('*')
      .where({ session_id: req.cookies.sessionId })
      .first()

    if (!user) {
      return res.status(400).send('user with this session_id not found')
    }

    const options = { id, user_id: user.id }

    const meal = await knex('meals').select('*').where(options).first()

    if (!meal) return res.status(400).send('Meal not found')

    res.send(meal)
  })

  app.put('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    let id, mealBody

    const paramSchema = z.object({
      id: z.string().uuid(),
    })

    const mealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      respect_diet: z.boolean().optional(),
    })

    try {
      const params = paramSchema.parse(req.params)
      id = params.id

      mealBody = mealBodySchema.parse(req.body)
    } catch (error) {
      return res.status(400).send(JSON.parse(String(error)))
    }

    const user = await knex('users')
      .select('*')
      .where({ session_id: req.cookies.sessionId })
      .first()
    if (!user) {
      return res.status(400).send('user with this session_id not found')
    }

    const meal = await knex('meals')
      .select('*')
      .where({ id, user_id: user.id })
      .first()
    if (!meal) {
      return res.status(400).send('meal not found for this user')
    }

    await knex('meals').where({ id }).update(mealBody)

    res.status(204)
  })

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const paramSchema = z.object({ id: z.string().uuid() })

      let id: string
      try {
        const params = paramSchema.parse(req.params)
        id = params.id
      } catch (error) {
        return res.status(400).send(JSON.parse(String(error)))
      }

      const user = await knex('users')
        .select('*')
        .where({ session_id: req.cookies.sessionId })
        .first()

      if (!user) {
        return res.status(400).send('user with this session_id not found')
      }

      const options = { id, user_id: user.id }

      const meal = await knex('meals').delete().where(options)

      if (!meal) return res.status(400).send('Meal not found')

      res.status(204)
    },
  )
}
