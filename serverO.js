
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

//payment error
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'payment=*, microphone=(), camera=(), geolocation=()');
  next();
});

// Security middleware
//
// app.use(helmet({
//   permissionsPolicy: false,
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://assets.calendly.com"],
//       imgSrc: ["'self'", "data:", "https:", "http:"],
//       connectSrc: ["'self'", "https://calendly.com", "https://assets.calendly.com"],
//       frameSrc: ["https://calendly.com"],
//       fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
//     }
//   }
// }));
// //

// Compression middleware
app.use(compression());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`NailzbyMaze website running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Access at: http://localhost:${PORT}`);
});

module.exports = app;