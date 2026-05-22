import postgres from "postgres";
import { Connector, IpAddressTypes } from "@google-cloud/cloud-sql-connector";

const connector = new Connector();

const clientOpts =
  import.meta.env.MODE === "production"
    ? await connector.getOptions({
        instanceConnectionName: "nuance-c9944:us-east4:bhvr-pg-test",
        ipType: IpAddressTypes.PUBLIC,
      })
    : { host: "localhost" };

export const sql = postgres({
  ...clientOpts,
  port: 5432,
  username: "postgres",
  password: process.env.POSTGRES_PASSWORD,
  database: "postgres",
});
