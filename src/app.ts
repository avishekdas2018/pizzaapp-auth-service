import express from "express";
import logger from "./config/logger";
import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";

const app = express();

app.get("/", (req, res) => {
  res.send("Well come to auth service...");
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;
