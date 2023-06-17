import { FastifyInstance } from 'fastify'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', {}, async (req, res) => {
    res.send({ message: 'users routes' })
  })
}
