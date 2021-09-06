import dotenv from 'dotenv'
import pg from 'pg';
import Column from './Column.js';
import Table from './Table.js';

const {Client} = pg;


dotenv.config()

export const client = new Client({
  connectionString: process.env.DATABASE_URL
});

export const TABLES = [];

export const connect = async () => {
  await client.connect();
  return client;
}

export const q = async (...args) => {
  try {
    const res = await client.query(...args);
    return res;
  } catch(e) {
    console.error('Query: Error with string: "' + args[0] + '"\n and values: \n"' + args[1] + '" \n\n' + e.stack)
  }
};

export const parseBoolString = s => s.toUpperCase() === 'YES'

// get tables in db and format them into Table classes
export const getTables = async () => {
  const res = await q('SELECT * FROM information_schema.tables;')
  
  // remove default internal rows from result
  const tablesRaw = res.rows.filter(({ table_name }) => table_name.includes('BACKOFFICE'))
  
  console.log('----------------------------------------------------------------')
  
  // get all columns
  const cols = await Promise.all(
    tablesRaw.map(
      ({ table_name }) => q(`SELECT * FROM information_schema.columns WHERE TABLE_NAME = '${table_name}'`)
    )
  )

  // parse response and create table
  const tables = tablesRaw.map(({ table_name }, i) => {
    const fullName = tablesRaw[i].table_name
    const internal = fullName.includes('INTERNAL');
    const name = internal ? fullName.split('BACKOFFICE_INTERNAL_')[1] : fullName.split('BACKOFFICE_')[1]
    return new Table({
      name,
      internal,
      ifNotExists: true,
      columns: cols[i].rows.map(
        ({ data_type, column_name, is_nullable }) => {
          return new Column({
            name: column_name,
            constraints: parseBoolString(is_nullable) ? [] : ['NOT NULL'],
            type: data_type,
          })
        }
      )
    })
  })

  TABLES.length = 0
  TABLES.push(...tables);
  return tables;
}

export const tableName = (n, internal = false) => internal ? 'BACKOFFICE_INTERNAL_' + n : 'BACKOFFICE_' + n

// get default tables, if none created, create default tables
export const verifyDefaults = async () => {
  // add uuid generation plugin
  await q('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  // add default tables
  const mediaTable = new Table({
    name: 'media',
    internal: false,
    ifNotExists: true,
    columns: [
      new Column({
        name: 'media_url',
        type: 'text',
        constraints: ['not null']
      }),
      new Column({
        name: 'title',
        type: 'text',
      }),
      new Column({
        name: 'type',
        type: 'text',
        constraints: ['not null']
      }),
    ],
  })
  const userTable = new Table({
    name: 'users',
    internal: true,
    ifNotExists: true,
    columns: [
      new Column({
        name: 'username',
        type: 'text',
        constraints: [],
      }),
      new Column({
        name: 'email',
        type: 'text',
        constraints: ['not null', 'unique'],
      }),
      new Column({
        name: 'password',
        type: 'text',
        constraints: ['not null'],
      }),
      new Column({
        name: 'organisations',
        type: 'uuid[]',
        constraints: []
      })
    ]
  })

  const orgaTable = new Table({
    name: 'organisations',
    internal: true,
    ifNotExists: true,
    columns: [
      new Column({
        name: 'name',
        type: 'text',
        constraints: ['not null'],
      }),
      new Column({
        name: 'email',
        type: 'text',
        constraints: ['not null', 'unique'],
      }),
      new Column({
        name: 'author_id',
        type: 'uuid',
        constraints: ['not null']
      })
    ]
  })
  
  mediaTable.create();
  userTable.create();
  orgaTable.create();
  return true; 
}