const http = require('http');

const data = JSON.stringify({
  message: 'hola',
  history: [],
  context: ''
});

const options = {
  hostname: 'localhost',
  port: 4000, // Angular SSR usually runs on 4000 by default in server.ts
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Request Error:', error);
});

req.write(data);
req.end();
