import request from 'supertest'
import { randomUUID } from 'crypto'
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

  it('should not be able list user meals with invalid session_id', async () => {
    const fakeCookie = [`sessionId=${randomUUID()}; Max-Age=604800000; Path=/`]

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', fakeCookie)

    expect(response.statusCode).toEqual(400)
  })

  it('should be able get an user meal by ID', async () => {
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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', sessionId)

    const mealID = listMealsResponse.body[0].id

    const response = await request(app.server)
      .get(`/meals/${mealID}`)
      .set('Cookie', sessionId)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeTruthy()
    expect(response.body.id).toEqual(mealID)
  })

  it('should not be able get an user meal by invalid ID', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'jonh doe',
    })

    const sessionId = createUserResponse.get('Set-Cookie')

    const response = await request(app.server)
      .get(`/meals/${randomUUID()}`)
      .set('Cookie', sessionId)

    expect(response.statusCode).toEqual(400)
  })

  it('should be able update a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'jonh doe' })

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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', sessionId)

    const mealID = listMealsResponse.body[0].id

    const updatedDate = new Date().toISOString()

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealID}`)
      .send({
        name: 'lunch updated',
        description: 'rice, chicken and fries',
        date: updatedDate,
        respect_diet: false,
      })
      .set('Cookie', sessionId)

    const mealUpdated = await request(app.server)
      .get(`/meals/${mealID}`)
      .set('Cookie', sessionId)

    expect(updateMealResponse.statusCode).toEqual(204)
    expect(mealUpdated.body).toEqual(
      expect.objectContaining({
        name: 'lunch updated',
        description: 'rice, chicken and fries',
        date: updatedDate,
        respect_diet: 0,
      }),
    )
  })

  it('should not be able update a meal by invalid ID', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'jonh doe' })

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

    const updateMealResponse = await request(app.server)
      .put(`/meals/${randomUUID()}`)
      .send({
        name: 'lunch updated',
        description: 'rice, chicken and fries',
        date: new Date().toISOString(),
        respect_diet: false,
      })
      .set('Cookie', sessionId)

    expect(updateMealResponse.statusCode).toEqual(400)
  })

  it('should be able delete an user meal by ID', async () => {
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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', sessionId)

    const mealID = listMealsResponse.body[0].id

    const response = await request(app.server)
      .delete(`/meals/${mealID}`)
      .set('Cookie', sessionId)

    expect(response.statusCode).toEqual(204)
  })

  it('should not be able delete a meal by invalid ID', async () => {
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

    const response = await request(app.server)
      .delete(`/meals/${randomUUID()}`)
      .set('Cookie', sessionId)

    expect(response.statusCode).toEqual(400)
  })
})
