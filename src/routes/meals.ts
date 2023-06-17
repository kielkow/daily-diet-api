import { FastifyInstance } from 'fastify'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', {}, async (req, res) => {
    res.send({ message: 'meals routes' })
  })
}
