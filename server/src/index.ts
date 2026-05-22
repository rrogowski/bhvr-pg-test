import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import z from "zod";
import { pool } from "./database";

export const app = new Hono()

  .use(cors())

  .use(logger())

  .get("/", (c) => {
    return c.text("Hello Hono!");
  })

  .get("/hello", async (c) => {
    const data = {
      message: "Hello BHVR!",
      success: true,
    };

    return c.json(data, { status: 200 });
  })

  .get("/sql", async (c) => {
    const result = await pool.query(`SELECT version() as version`);
    return c.json({ version: result.rows.at(0)?.version }, { status: 200 });
  })

  .post(
    "/sandbox",
    zValidator(
      "json",
      z.object({
        foo: z.number().max(30),
      }),
    ),
    async (c) => {
      const data = c.req.valid("json");
      return c.json({
        success: true,
        doubled: data.foo * 2,
      });
    },
  );

export default app;
