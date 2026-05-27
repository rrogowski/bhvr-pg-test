import { Pool } from "pg";
import { Connector, IpAddressTypes } from "@google-cloud/cloud-sql-connector";

const connector = new Connector();

const clientOpts =
  process.env.MODE === "production"
    ? {
        ...(await connector.getOptions({
          instanceConnectionName: "nuance-c9944:us-east4:bhvr-pg-test",
          ipType: IpAddressTypes.PUBLIC,
        })),
      }
    : {};

export const pool = new Pool({
  ...clientOpts,
  user: "postgres",
  password: process.env.POSTGRES_PASSWORD,
  database: "postgres",
});
