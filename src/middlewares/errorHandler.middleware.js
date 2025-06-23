export const errorHandler = (err, req, res, next) => {
  console.error("Unexpected Error:", err);
  
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error]: ${message}`);

  return res.status(status).json({
    success: false,
    message
  });
};