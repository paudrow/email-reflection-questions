import { Db } from "../src/db.ts";

const kv = await Deno.openKv();
const db = new Db(kv);

console.log(db.toString());
