import { TABLES } from '../db/index.js';

const asyncMiddleware = fn => (
  (req, res, next) => {
    console.log(req.method + ' ' + req.baseUrl + req.path)
    Promise.resolve(fn(req, res, next))
      .catch(next);
  }
)

export const createRoutes = (app) => {
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
  }
}