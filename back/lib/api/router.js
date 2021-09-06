import { TABLES } from '../db/index.js';

const asyncMiddleware = fn => (
  (req, res, next) => {
    console.log(req.method + ' ' + req.baseUrl + req.path)
    Promise.resolve(fn(req, res, next))
      .catch(next);
  }
)

export const createRoutes = (app) => {
  // list all tables
  app.get('/_table', asyncMiddleware(async (req, res, next) => {
    res.json({
      data: TABLES.map(t => ({...t, fullName: t.fullName})),
    })
  }))

  // add new table
  app.post('/_table', asyncMiddleware(async (req, res, next) => {
    try {
      const t = new Table({
        ...req.body,
        internal: false,
        columns: req.body.columns.map(c => new Column({...c}))
      })
      await t.create()
      res.sendStatus(200)
    } catch(e) {
      console.error(e);
      res.sendStatus(400)
    }
  }))


  for(let table of TABLES) {
    const routeName = table.internal ? '/internal/' + table.name : '/'+ table.name

    app.get(routeName, asyncMiddleware(async (req, res, next) => {
      const { rows } = await table.getAllRows()
      res.json({data: rows});
    }))

    app.get(routeName + '/:id', asyncMiddleware(async (req, res, next) => {
      const { rows } = await table.selectId(req.params.id)
      res.json({data: rows});
    }))

    app.get(routeName + '/:prop/:value', asyncMiddleware(async (req, res, next) => {
      console.log(req.params)
      const { rows } = await table.selectProp(req.params.prop, req.params.value);
      res.json({data: rows})
    }))

    app.post(routeName, asyncMiddleware(async (req, res, next) => {
      if(table.validate(req.body)) {
        await table.insert(req.body)
        res.sendStatus(200)
      } else {
        res.sendStatus(400)
      }
    }))

    app.put(routeName + '/:id', asyncMiddleware(async (req, res, next) => {
      try {
        await table.update(req.params.id, req.body)
        res.sendStatus(200)
      } catch(e) {
        console.error(e);
        res.sendStatus(400)
      }
    }))

    app.delete(routeName + '/:id', asyncMiddleware(async (req, res, next) => {
      try {
        await table.deleteRow(req.params.id)
        res.sendStatus(200)
      } catch(e) {
        console.error(e),
        res.sendStatus(400)
      }
    }))
  }
}