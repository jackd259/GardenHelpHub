import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Initialize Express with production defaults
const app = express();
app.disable('x-powered-by'); // Security best practice
app.use(express.json({ limit: '10kb' })); // Prevent memory overload
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Request logging middleware (optimized for production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production' || req.path.startsWith('/api')) {
    const start = Date.now();
    const originalJson = res.json;

    res.json = function(body) {
      res.locals.responseBody = body;
      return originalJson.call(this, body);
    };

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logLine = [
        req.method,
        req.path,
        res.statusCode,
        `${duration}ms`,
        res.locals.responseBody ? JSON.stringify(res.locals.responseBody) : ''
      ].join(' ');

      log(logLine.slice(0, 200)); // Truncate very long logs
    });
  }
  next();
});

// Production error handler (no stack traces leaked)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });

  if (status >= 500) {
    console.error('Server Error:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: _req.path
    });
  }
});

// Server initialization
async function initializeServer() {
  try {
    // Load routes and middleware
    const server = await registerRoutes(app);

    // Static assets handling
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);

      // Production-specific middleware
      app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
          return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
      });
    } else {
      await setupVite(app, server);
    }

    // Start server
    const port = parseInt(process.env.PORT || '5000');
    return server.listen(port, '0.0.0.0', () => {
      log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);

      // Memory monitoring
      if (process.env.NODE_ENV === 'production') {
        setInterval(() => {
          const usedMB = process.memoryUsage().heapUsed / 1024 / 1024;
          if (usedMB > 450) { // Alert at 450MB (under 512MB limit)
            log(`Memory warning: ${usedMB.toFixed(2)}MB used`);
          }
        }, 30000); // Check every 30 seconds
      }
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

// Start server with error handling
initializeServer().catch(error => {
  console.error('Fatal startup error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received - shutting down gracefully');
  process.exit(0);
});

// Unhandled rejection tracking
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
