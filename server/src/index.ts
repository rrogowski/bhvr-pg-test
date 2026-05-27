import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import z, { type ZodSafeParseError } from "zod";
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

  .get("/users", async (c) => {
    const result = await pool.query<{ first_name: string; age: number }>(
      `SELECT first_name, age FROM "User" WHERE first_name = $1`,
      ["Bob"],
    );
    return c.json({ users: result.rows, success: true });
  })

  .post(
    "/users",
    zValidator(
      "json",
      z.object({ name: z.string(), age: z.number().min(20) }),
      (result, c) => {
        if (!result.success) {
          return c.json(
            {
              success: false,
              errors: result.error.issues,
            } as const,
            400,
          );
        }
      },
    ),
    async (c) => {
      const user = c.req.valid("json");
      console.log("creating new user", user);

      const result = await pool.query<{ first_name: string; age: number }>(
        `INSERT INTO "User" VALUES($1, null, $2) RETURNING *;`,
        [user.name, user.age],
      );
      console.log(result.rowCount);

      if (result.rowCount === 1) {
        return c.json({ data: result.rows[0], success: true });
      }

      return c.json({ errors: ["Unknown Error Occurred"], success: false });
    },
  )

  .get("/sql", async (c) => {
    const result = await pool.query(`SELECT version() as version`);
    return c.json({ version: result.rows.at(0)?.version }, { status: 200 });
  })

  .get("/double/:value", async (c) => {
    const value = Number(c.req.param("value"));
    console.log("value", value);
    const result = await pool.query<{ sum: number }>(
      `SELECT ($1::smallint + $2::smallint) as sum`,
      [value, value],
    );
    return c.json({ sum: result.rows.at(0)?.sum }, { status: 200 });
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
