import { ErrorRequestHandler } from "express";

const globalError: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error:err.message
  });
};

export default globalError;