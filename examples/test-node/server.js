const express = require('express');
const app = express();
const port = 3000;

// Testing REAL LIVE RELOAD with nodemon!
let counter = 0;

app.get('/', (req, res) => {
  counter++;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Counter App</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          text-align: center;
          background: white;
          padding: 50px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        .counter {
          font-size: 72px;
          font-weight: bold;
          color: #667eea;
          margin: 30px 0;
        }
        .info {
          color: #666;
          margin-top: 20px;
        }
        button {
          background: #667eea;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 20px;
          transition: background 0.3s;
        }
        button:hover {
          background: #764ba2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔢 Counter App</h1>
        <div class="counter">${counter}</div>
        <p class="info">Reload the page to increment the counter</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Counter app listening at http://localhost:${port}`);
});
