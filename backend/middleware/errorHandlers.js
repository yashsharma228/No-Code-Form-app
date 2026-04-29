export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.name === "CastError") {
    return res.status(400).json({ error: "Invalid resource identifier." });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: Object.values(error.errors).map((entry) => entry.message).join(" ") });
  }

  if (error.code === 11000) {
    return res.status(409).json({ error: "A unique value already exists for this record." });
  }

  return res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
}