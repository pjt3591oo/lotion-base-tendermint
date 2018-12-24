let { connect } = require('lotion');

let GCI = '9afb7630408b54f9f56eb810316564460b189b8d91d936ecdb9373603d97ca64';

(async function() {
    try {
        let { state, send } = await connect(GCI)
        let result = await send({ type: "ADD", payload: {"title": "test"} })
        let data = await state
        console.log(data)
        process.exit()
    } catch (err) {
        console.log('-----------')
        console.log(error(err))
    }
})()