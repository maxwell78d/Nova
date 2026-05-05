const http = require('http');
const fs = require('fs');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat',
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => fs.writeFileSync('error_output.txt', data));
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({message: 'hola'}));
req.end();
