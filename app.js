const express = require('express')
const app = express()

app.use(express.static('./public'))

app.listen(9000, () => {
    console.log('服务器启动成功');
});