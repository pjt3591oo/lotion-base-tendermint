import * as path from 'path';
// must be called before lotion import
require('dotenv').config({ path: path.resolve(__dirname, '../.env-node') });

import * as lotion from 'lotion';
import initialState from './state';
import { txMiddleware } from './middleware';

const genesisPath = path.resolve(__dirname, '../config/genesis.json');
const keyPath = path.resolve(__dirname, '../config/priv_validator.json');

async function startup() {
  
  const app = lotion({ 
    genesisPath, keyPath, initialState, devMode: true, logTendermint: true ,
    abciPort: process.env.ABCIPORT,
    p2pPort: process.env.P2PPORT,
    rpcPort: process.env.RPCPORT
  });

  app.use(txMiddleware);
  // const appInfo = await app.listen(process.env.TX_SERVER_PORT);
  const appInfo = await app.start();
  console.log('AppInfo', JSON.stringify(appInfo, null, 2));
}

startup();
