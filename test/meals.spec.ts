import request from 'supertest'
import { execSync } from 'child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('MEALS ROUTES', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able create a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'jonh doe',
    })

    const sessionId = createUserResponse.get('Set-Cookie')

    const { statusCode } = await request(app.server)
      .post('/meals')
      .send({
        name: 'lunch',
        description: 'rice and chicken',
        date: new Date().toISOString(),
        respect_diet: true,
      })
      .set('Cookie', sessionId)

    expect(statusCode).toEqual(201)
  })

  it('should not be able create a meal without session_id', async () => {
    const { statusCode } = await request(app.server).post('/meals').send({
      name: 'lunch',
      description: 'rice and chicken',
      date: new Date().toISOString(),
      respect_diet: true,
    })

    expect(statusCode).toEqual(401)
  })
})
