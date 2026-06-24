import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Anti-DDoS Rate Limiting ─────────────────────────────────────────── */
// General limiter: max 200 req / 5 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak permintaan. Coba lagi dalam beberapa menit." },
  skip: (req) => req.method === "OPTIONS",
});

// Auth-specific limiter: max 15 req / 5 minutes per IP (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan login. Coba lagi dalam 5 menit." },
});

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/change-password", authLimiter);

app.use("/api", router);

export default app;
