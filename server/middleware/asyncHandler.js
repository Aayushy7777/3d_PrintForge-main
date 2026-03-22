/**
 * Wrapper for async route handlers to catch errors
 * Ensures all errors are passed to Express error handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
