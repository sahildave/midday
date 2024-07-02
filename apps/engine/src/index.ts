import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "hono";
import { env } from "hono/adapter";
import { bearerAuth } from "hono/bearer-auth";
import { cache } from "hono/cache";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import accountRoutes from "./routes/accounts";
import authRoutes from "./routes/auth";
import healthRoutes from "./routes/health";
import institutionRoutes from "./routes/institutions";
import transactionsRoutes from "./routes/transactions";
import { logger as customLogger } from "./utils/logger";

type Bindings = {
  KV: KVNamespace;
  TELLER_CERT: Fetcher;
  GOCARDLESS_SECRET_KEY: string;
  GOCARDLESS_SECRET_ID: string;
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  PLAID_ENVIRONMENT: string;
};

export const app = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          ok: false,
          source: "error",
        },
        422,
      );
    }
  },
});

const apiRoutes = app.use(
  "/api/*",
  (c, next) => {
    const { API_SECRET_KEY } = env<{ API_SECRET_KEY: string }>(c);
    const bearer = bearerAuth({ token: API_SECRET_KEY });

    return bearer(c, next);
  },
  secureHeaders(),
  logger(customLogger),
  cache({
    cacheName: "engine",
    cacheControl: "max-age=3600",
  }),
);

apiRoutes
  .route("/transactions", transactionsRoutes)
  .route("/accounts", accountRoutes)
  .route("/institutions", institutionRoutes)
  .route("/auth", authRoutes);

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

apiRoutes.get(
  "/",
  swaggerUI({
    url: "/openapi",
  }),
);

app.doc("/openapi", {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "Midday Engine API",
  },
});

app.route("/health", healthRoutes);

export default {
  scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // const delayedProcessing = async () => {
    //   // await cronTask(env);
    // };
    // ctx.waitUntil(delayedProcessing());
  },
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
