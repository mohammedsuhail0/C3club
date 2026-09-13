import { handleApiRequest } from '../server/backendHandler.js';

export default function handler(req, res) {
  return handleApiRequest(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  });
}
