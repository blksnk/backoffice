import { q } from '../db/index.js';

// get all rows in table
export const getAll = async (tableName) => {
  const s = `SELECT * from "${tableName}"`;
  const res = await q(s)
  return res;
}
