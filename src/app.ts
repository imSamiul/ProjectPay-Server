import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { requestLogger } from "./middleware/request-logger";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.get("/", (_req, res) => {
    res.send("Express on Vercel");
  });

  app.get("/api/v1/health", (_req, res) => {
    res.json({ success: true, status: "ok" });
  });

  app.use("/api/v1", routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
