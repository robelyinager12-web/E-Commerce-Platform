
/// <reference path="./types/express.d.ts" />

import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { corsOptions } from "./config/cors";
import { logger } from "./config/logger";
import routes from "./routes";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/error.middleware";

const app: Application = express();

// 1. CORS — run before routes and error handlers.
app.use(cors(corsOptions));

// 2. Security headers.
app.use(helmet());

// 3. Parse request bodies and cookies.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// 4. Request logging.
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// 5. Global rate limiting.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use(globalLimiter);

// 6. API routes.
app.use("/api/v1", routes);

// 7. Handle unknown routes.
app.use(notFoundHandler);

// 8. Centralized error handler — keep last.
app.use(errorHandler);

export default app;
