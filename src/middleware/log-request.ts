import { FastifyReply, FastifyRequest } from 'fastify'

export async function logRequest(req: FastifyRequest, res: FastifyReply) {
  console.log('REQUEST:', {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    session_id: req.cookies.sessionId,
  })
}
