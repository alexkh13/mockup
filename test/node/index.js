const path = require('path');
const express = require('express');
const Mock = require('../../mockup.node');

let app = express();

let mock = Mock({
    path: path.resolve(__dirname, '../rest'),
    debug: true
});

app.use('/api', mock);

app.listen(3000);