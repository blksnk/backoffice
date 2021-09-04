
import { initApi, app } from './lib/api/index.js';
import { getTables, client, connect, verifyDefaults } from './lib/db/index.js';

const main = async () => {
  connect()
  await verifyDefaults();
  await getTables()
  
  initApi();
}

main()