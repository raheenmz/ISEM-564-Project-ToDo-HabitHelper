import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const isProd = process.env.NODE_ENV === "production";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:80",
  "http://localhost",
  ...(process.env.REPLIT_DEV_DOMAIN
    ? [`https://${process.env.REPLIT_DEV_DOMAIN}`]
    : []),
  ...(process.env.APP_ORIGIN
    ? [process.env.APP_ORIGIN]
    : []),
];

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const allowed = ALLOWED_ORIGINS.some((o) => origin === o || origin.startsWith(o));
      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "taskforce-dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

if (isProd) {
  const publicPath = path.resolve(
    process.cwd(),
    "artifacts/task-force/dist/public",
  );

  app.use(express.static(publicPath));

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

export default app;
