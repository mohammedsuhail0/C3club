import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const PORTS = [
  { port: 5000, mode: 'topo', name: 'C3 Official Portal (Fluid Topo Waves - Default Production)' },
  { port: 5001, mode: 'mesh', name: 'Vector Mesh (Elastic Grid & Shockwaves)' },
  { port: 5002, mode: 'topo', name: 'Topo Waves (Fluid Contours & Water Ripples)' },
  { port: 5003, mode: 'circuit', name: 'Silicon PCB (Circuit Traces & Data Pulses)' },
  { port: 5004, mode: 'matrix', name: 'Code Matrix (Engineering Monospace Glyphs)' },
  { port: 5005, mode: 'voronoi', name: 'Voronoi Lattice (Kinetic Mesh & Spring Physics)' },
  { port: 5006, mode: 'wireframe3d', name: '3D Wireframe (Rotating Icosahedron & Tesseract)' },
  { port: 5007, mode: 'magnetic', name: 'Magnetic Flux (Maxwell Field Lines & Polarity Flip)' },
  { port: 5008, mode: 'radar', name: 'Radar Sonar (Polar Range Rings & Oscilloscope)' },
  { port: 5009, mode: 'hex', name: 'Hex Matrix (Honeycomb Grid & Extrusion Ripples)' },
  { port: 5010, mode: 'sineflow', name: 'Sine Spectrum (Laser Interferometry & Harmonics)' },
  { port: 5011, mode: 'lorenz', name: 'Lorenz Attractor (3D Chaos Phase Space Trajectories)' },
  { port: 5012, mode: 'spacetime', name: 'Einstein Spacetime (Schwarzschild Metric Geodesics)' },
  { port: 5013, mode: 'fourier', name: 'Fourier Epicycles (Harmonic Phasor Decomposition)' },
  { port: 5014, mode: 'optics', name: 'Prism Optics (Snell Law Ray Tracing & Dispersion)' },
  { port: 5015, mode: 'quantum', name: 'Quantum Tunneling (Schrödinger Barrier Wavepacket)' },
  { port: 5016, mode: 'seismic', name: 'Seismograph (3-Channel Tectonic Accelerometer)' },
  { port: 5017, mode: 'fibonacci', name: 'Golden Spiral (Logarithmic Phyllotaxis Helices)' },
  { port: 5018, mode: 'aerodynamics', name: 'Wind Tunnel (Navier-Stokes NACA Airfoil)' },
  { port: 5019, mode: 'orbital', name: 'Kepler Orbit (Celestial Mechanics Ellipses)' },
  { port: 5020, mode: 'spectrogram', name: 'DSP Spectrogram (FFT Frequency Waterfall)' },
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

function startServer({ port, mode, name }) {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    let filePath = path.join(DIST_DIR, reqPath);

    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
    });
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[C3 BG Server] Port ${port} [${mode.toUpperCase()}] -> http://localhost:${port} | http://192.168.1.9:${port} (${name})`);
  });

  return server;
}

console.log('============================================================');
console.log('🚀 C3 Multi-Port Background Studio: 20 Scientific Engines Active');
console.log('============================================================');

PORTS.forEach(startServer);
