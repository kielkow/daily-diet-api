import request from 'supertest'
import { randomUUID } from 'crypto'
import { execSync } from 'child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('MEALS ROUTES', () => {
  beforeAll(async () => {
    await app.ready()

    execSync('npm run knex migrate:rollback --all')
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

  it('should not be able create a meal with invalid body', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'jonh doe',
    })

    const sessionId = createUserResponse.get('Set-Cookie')

    const { statusCode } = await request(app.server)
      .post('/meals')
      .send({
        name: 'lunch',
        description: '',
        date: null,
        respect_diet: true,
      })
      .set('Cookie', sessionId)

    expect(statusCode).toEqual(400)
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

  it('should not be able create a meal with invalid session_id', async () => {
    const fakeCookie = [`sessionId=${randomUUID()}; Max-Age=604800000; Path=/`]

    const { statusCode } = await request(app.server)
      .post('/meals')
      .send({
        name: 'lunch',
        description: 'rice and chicken',
        date: new Date().toISOString(),
        respect_diet: true,
      })
      .set('Cookie', fakeCookie)

    expect(statusCode).toEqual(400)
  })

  it('should be able list user meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'jonh doe',
    })

    const sessionId = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .send({
        name: 'lunch',
        description: 'rice and chicken',
        date: new Date().toISOString(),
        respect_diet: true,
      })
      .set('Cookie', sessionId)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'dinner',
        description: 'rice and steak',
        date: new Date().toISOString(),
        respect_diet: true,
      })
      .set('Cookie', sessionId)

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', sessionId)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeTruthy()
    expect(response.body.length).toEqual(2)
  })
})
