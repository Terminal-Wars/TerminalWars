const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

// app.get('/', async (req, res) => {
// 	res.sendFile(`${__dirname}/templates/editor.html`)
// })

app.use('/', express.static('templates'))

app.use('/static', express.static('static'))

app.ws('/socket', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req.testing);
});

app.listen(3000);