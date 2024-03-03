import { assertEquals } from "https://deno.land/std@0.218.0/assert/mod.ts";
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.217.0/testing/bdd.ts";
import { ulid } from "https://deno.land/x/ulid/mod.ts";
import { Db } from "./db.ts";

describe("db", () => {
  let db: Db;
  let kv: Deno.Kv;
  const user = "test";

  const replyRed = {
    id: ulid(),
    question: "What is your favorite color?",
    answer: "Red",
    date: new Date("2022-01-01T00:00:00Z"),
    who: user,
  };
  const replyBlue = {
    id: ulid(),
    question: "What is your favorite color?",
    answer: "Blue",
    date: new Date("2022-01-02T00:00:00Z"),
    who: user,
  };

  beforeEach(async () => {
    const tempFile = await Deno.makeTempFile();
    kv = await Deno.openKv(tempFile);
    db = new Db(kv);
  });

  afterEach(() => {
    kv.close();
  });

  it("should create two replies", async () => {
    assertEquals((await db.getReplies(user)).length, 0);
    await db.createReply(user, replyRed);
    assertEquals((await db.getReplies(user)).length, 1);
    await db.createReply(user, replyBlue);
    assertEquals((await db.getReplies(user)).length, 2);
  });

  it("should get a reply by id", async () => {
    await db.createReply(user, replyRed);
    const result = await db.getReplyById(user, replyRed.id);
    assertEquals(result, replyRed);
  });

  it("should get replies by question", async () => {
    await db.createReply(user, replyRed);
    await db.createReply(user, replyBlue);
    const result = await db.getRepliesByQuestion(user, replyRed.question);
    assertEquals(result, [replyRed, replyBlue]);
  });

  it("should get all replies for a user", async () => {
    assertEquals((await db.getReplies(user)).length, 0);

    await db.createReply(user, replyRed);
    await db.createReply(user, replyBlue);
    const result = await db.getReplies(user);
    assertEquals((await db.getReplies(user)).length, 2);
    assertEquals(result, [replyRed, replyBlue]);
  });

  it("should delete a reply", async () => {
    assertEquals((await db.getReplies(user)).length, 0);

    await db.createReply(user, replyRed);
    await db.createReply(user, replyBlue);
    assertEquals((await db.getReplies(user)).length, 2);

    await db.deleteReply(user, replyRed);
    assertEquals((await db.getReplies(user)).length, 1);
    assertEquals(await db.getReplies(user), [replyBlue]);

    await db.deleteReply(user, replyBlue);
    assertEquals((await db.getReplies(user)).length, 0);
    assertEquals(await db.getReplies(user), []);
  });

  it("should get all users", async () => {
    assertEquals(await db.getUsers(), []);
    await db.createReply(user, replyRed);
    assertEquals(await db.getUsers(), [user]);
    await db.createReply(user, replyBlue);
    assertEquals(await db.getUsers(), [user]);
  });
});
