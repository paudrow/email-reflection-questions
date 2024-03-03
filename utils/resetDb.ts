import { resetDb } from "../src/db.ts";

const kv = await Deno.openKv();
await resetDb(kv);
