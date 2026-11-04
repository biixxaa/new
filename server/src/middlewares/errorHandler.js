export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'An internal sanctum disturbance occurred.';

  // Privacy-conscious logging: don't log passwords or sensitive tokens
  console.error(`❌ [Error Handler] [${req.method} ${req.url}] Status: ${status} - Message: ${message}`);

  res.status(status).json({
    success: false,
    message,
    attemptsRemaining: err.attemptsRemaining,
    waitSeconds: err.waitSeconds,
  });
}

