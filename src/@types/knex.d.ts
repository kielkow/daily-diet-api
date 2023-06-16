// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    table_name: {
      id: string
      name: string
      created_at: string
      session_id?: string
    }
  }
}
