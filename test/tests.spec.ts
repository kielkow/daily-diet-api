import request from 'supertest'
import { execSync } from 'child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('TESTS ROUTES', () => {
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

  it('should be able connect with API', async () => {
    const response = await request(app.server).get('/status')

    expect(response.statusCode).toEqual(200)
  })
})
