// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import * as schema from "./migrations/schema";
// import dotenv from "dotenv";

// dotenv.config({ quiet: true });

// if (!process.env.POSTGRES_URL) {
//   throw new Error("POSTGRES_URL environment variable is not set");
// }

// export const client = postgres(process.env.POSTGRES_URL);
// export const db = drizzle(client, { schema: schema });
import dotenv from "dotenv";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./migrations/schema";

const poolConnection = postgres(process.env.POSTGRES_URL!);

let db: PostgresJsDatabase<typeof schema>;

declare global {
  var db: PostgresJsDatabase<typeof schema>;
}

if (process.env.NODE_ENV === "production") {
  dotenv.config({ quiet: true });
  db = drizzle(poolConnection, { schema });
} else {
  if (!global.db) {
    dotenv.config({});
    global.db = drizzle(poolConnection, { schema });
  }
  db = global.db;
}

export { db };
