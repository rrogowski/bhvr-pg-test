import postgres from "postgres";
import { Connector, IpAddressTypes } from "@google-cloud/cloud-sql-connector";

const connector = new Connector();

console.log("process.env");
console.log(process.env);

const clientOpts =
  process.env.MODE === "production"
    ? await connector.getOptions({
        instanceConnectionName: "nuance-c9944:us-east4:bhvr-pg-test",
        ipType: IpAddressTypes.PUBLIC,
      })
    : { host: "localhost" };

console.log("client opts");
console.log(clientOpts);

export const sql = postgres({
  ...clientOpts,
  port: 5432,
  username: "postgres",
  password: process.env.POSTGRES_PASSWORD,
  database: "postgres",
});
