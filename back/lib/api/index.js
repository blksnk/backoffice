import express from 'express';
import cors from 'cors';
import {createRoutes} from './router.js';
import { getTables, client, connect, verifyDefaults } from '../db/index.js';

export const app = express();

app.use(cors())
app.use(express.json())


export async function initApi () {
  createRoutes(app)

  app.listen(process.env.PORT || 5000, () => {
    console.log('server listening on port ' + process.env.PORT || 5000)
  })
}