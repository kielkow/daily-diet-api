import request from 'supertest'
import { execSync } from 'child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('USERS ROUTES', () => {
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

  it('should be able create an user', async () => {
    const { statusCode } = await request(app.server).post('/users').send({
      name: 'jonh doe',
    })

    expect(statusCode).toEqual(201)
  })

  it('should not be able create an user without name', async () => {
    const { statusCode } = await request(app.server).post('/users').send({
      name: '',
    })

    expect(statusCode).toEqual(400)
  })
})
