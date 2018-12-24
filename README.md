# 네트워크 구동

## install

* clone

```
$ https://github.com/pjt3591oo/lotion-base-tendermint.git
$ cd lotion-base-teddermint
```

* global

```bash
$ npm install -g typescrypt
$ npm install -g ts-node
```

* dependencies

```bash
$ npm i
```

## create genesis

```
$ init.sh
```

해당 프로젝트에 `config` 디렉토리가 생성된 후 다음 파일들이 생성됨

* config.toml
* genesis.json
* node_key.json
* priv_validator.json

## start blockchain

```
$ ts-node ./src/app.ts
```

```
AppInfo {
  "ports": {
    "abci": "46656",
    "p2p": "46657",
    "rpc": "3000"
  },
  "GCI": "9afb7630408b54f9f56eb810316564460b189b8d91d936ecdb9373603d97ca64",
  "genesisPath": "/Users/pjt/Desktop/lotion_test/config/genesis.json"
}
```

해당 부분에서 genesisPath의 파일 디렉터리에 있는 `genesis.json`과 `node_key.json`을 이용하여 `GCI`를 생성합니다.

`GCI`는 추후에 클라이언트 프로그램을 만들때 필요합니다. 또한 해당 `genesis.json`과 `node_key.json`을 이용하여 체인데이터 디렉터리를 생성합니다.

체인 데이터 디렉터리는 `~/.lotion/networks/{genesis.json + node_key.json 암호회}/`에 생성됩니다.

> 참고: lotion의 버그 중 하나는 `genesis.json`과 `node_key.json`이 같을경우 같은 디렉터리로 연결되는데 해당 노드에 tx가 존재한 상태에서 노드를 껐다가 키면 에러가 발생합니다.

이때는 `init.sh`를 다시 실행하여 `genesis.json`을 다시 생성하여 `./src/app.ts`를 실행하거나 `~/.lotion/notworks`디렉터리에 있는 체인데이터들을 지워주면 됩니다.

## transaction by client

* client.js

```javascript

let { connect } = require('lotion');

let GCI = '9afb7630408b54f9f56eb810316564460b189b8d91d936ecdb9373603d97ca64';

(async function() {
    try {
        let { state, send } = await connect(GCI)
        let result = await send({ type: "ADD", payload: {"title": "test"} }) // transaction 발생
        let data = await state // 조회
        console.log(data)
        process.exit()
    } catch (err) {
        console.log('=e=r=r=o=r=')
        console.log(error(err))
    }
})()
```

GCI는 앞에서 app.ts를 실행하고 터미널에 출력되는 GCI를 입력합니다.

> 참고 genesis.json과 node_key.json이 같으면 GCI는 동일합니다.

```bash
$ node client.js
```

# 코드리뷰

해당 프로그램은 3개의 파일로 구성됩니다.

* app.ts: 노드 설정관리

* middleware.ts: message 종류(type)에 따라 transaction 처리

* state.ts: 상태관리


## app.ts

노드에 사용되는 포트, 각종 파일들을 설정한 후 middleware.ts를 미들웨어에 등록 후 실행

## middleware.ts

message 타입에 따라 라우팅 설정

* 타입정의

```javascript
export enum TxType {
  ADD = 'ADD',
  COMPLETE = 'COMPLETE',
  UNDO_COMPLETE = 'UNDO-COMPLETE',
}
```

* 핸들러 생성

```javascript
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
```

해당 프로젝트에서 사용하는 타입과 핸들러를 정의합니다. 

여기서 메시지 타입이란 앞의 `client.js` 프로그램에서 다음과 같은 부분이 있습니다.

```javascript
let result = await send({ type: "ADD", payload: {"title": "test"} }) // transaction 발생
```

여기서 type을 의미합니다.

해당 블록체인 어플리케이션은 type에 따라 트랜잭션 처리를 합니다. 

* 타입에 따라 핸들러 등록

```javascript
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
```

## state.ts

state.ts는 해당 블록체인에서 관리하는 데이터 인터페이스를 정의합니다.

```javascript
export interface State {
items: Item[];
}

export interface Item {
title: string;
completed: boolean;
timestamp: number;
}

const initialState: State = { items: [] };
export default initialState;
```