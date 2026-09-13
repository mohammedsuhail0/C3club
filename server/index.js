import http from 'http';
import { handleApiRequest } from './backendHandler.js';

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  handleApiRequest(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  });
});

server.listen(PORT, () => {
  console.log(`⚡ C3 Collective Backend running on http://localhost:${PORT}`);
});
