import { State, Item } from './state';

interface ChainInfo {
  height: number;
  validators: { [pubkey: string]: number }; // voting power distribution for validators
}

// lotion middleware type
enum MiddlewareType {
  TX = 'tx',
  QUERY = 'query',
  BLOCK = 'block',
  INITIALIZER = 'initializer',
  TX_ENDPOINT = 'tx-endpoint',
  POST_LISTEN = 'post-listen',
}

export interface Middleware {
  type: MiddlewareType;
  middleware: any;
}

export interface Tx<T> {
  sender: string;
  type?: TxType;
  payload?: T;
}

export interface TxTypeToHandler {
  [txType: string]: TxHandler | TxHandler[];
}

export type TxHandler<T = any> = (state: State, tx: Tx<T>, chainInfo?: ChainInfo) => void;

export enum TxType {
  ADD = 'ADD',
  COMPLETE = 'COMPLETE',
  UNDO_COMPLETE = 'UNDO-COMPLETE',
}

const add: TxHandler<{ title: string }> = (state, { payload }) => {
  console.log(state)
  console.log(payload)
  if (!payload || typeof payload.title !== 'string') return;

  const item = { title: payload.title, completed: false, timestamp: Date.now() };
  state.items.push(item);
};

const toggleTo = (completed): TxHandler<{ index: number }> => (state, { payload }) => {
  if (!payload || typeof payload.index !== 'number') return;

  const item = state.items[payload.index];
  item.completed = completed;
};

const complete = toggleTo(true);

const undoComplete = toggleTo(false);

/**
 * creates txMiddleware which maps txType to txHandler
 * @param txTypeHandlers plain object of txHandler(s) for txType
 * @param fallbackHandler txHandler for unhandled tx
 */
const createTxMiddleware = (txTypeHandlers: TxTypeToHandler, fallbackHandler?: TxHandler): Middleware =>
  ({
    type: MiddlewareType.TX,
    middleware: (state, tx, chainInfo) => {
      const txType = tx.type;
      const handler = txTypeHandlers[txType] || fallbackHandler;
      if (handler) {
        Array.isArray(handler)
          ? handler.forEach(h => h(state, tx, chainInfo))
          : handler(state, tx, chainInfo);
      }
    },
  });

export const txMiddleware = createTxMiddleware({
  [TxType.ADD]: add,
  [TxType.COMPLETE]: complete,
  [TxType.UNDO_COMPLETE]: undoComplete,
}, (state, tx, chainInfo) => {
  console.log(JSON.stringify({ tx, chainInfo }, null, 2));
  return new Error('no handler for tx');
});