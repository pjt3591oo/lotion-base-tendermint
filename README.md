# install

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

# create genesis

```
$ init.sh
```

해당 프로젝트에 `config` 디렉토리가 생성된 후 다음 파일들이 생성됨

* config.toml
* genesis.json
* node_key.json
* priv_validator.json

# start blockchain

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

# transaction by client

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

참고로 genesis.json과 node_key.json이 같으면 GCI는 동일합니다.

```bash
$ node client.js
```

