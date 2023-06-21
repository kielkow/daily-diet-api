import request from 'supertest'
import { execSync } from 'child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('SERVER ROUTES', () => {
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

  it('should be able connect with API', async () => {
    const response = await request(app.server).get('/status')

    expect(response.statusCode).toEqual(200)
  })

  it('should be able connect with Database', async () => {
    const response = await request(app.server).get('/status-database')

    expect(response.statusCode).toEqual(200)
  })
})
