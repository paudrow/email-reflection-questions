import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { Reply } from "./types.ts";

async function getKv<T>(kv: Deno.Kv, path: Deno.KvKey, schema: z.Schema<T>) {
  const kvResult = await kv.get(path);
  if (!kvResult || !kvResult.value) {
    return null;
  }
  const zodResult = schema.safeParse(kvResult.value);
  if (zodResult.success) {
    return zodResult.data;
  }
  throw new Error(
    `Error parsing ${path.join("/")} from KV: ${zodResult.error}`,
  );
}

export async function resetDb(kv: Deno.Kv) {
  for await (
    const entry of kv.list({
      prefix: [],
    })
  ) {
    kv.delete(entry.key);
  }
}

function byDate(a: Reply, b: Reply) {
  return a.date.getTime() - b.date.getTime();
}

export class Db {
  constructor(private kv: Deno.Kv) {}

  async getUsers() {
    const users = new Set<string>();
    for await (const entry of this.kv.list({ prefix: [] })) {
      users.add(entry.key[0].toString());
    }
    return Array.from(users);
  }

  async toString() {
    const users = await this.getUsers();

    let out = "";
    if (users.length === 0) {
      out += "No users found\n";
    }
    for (const user of users) {
      out += user + "\n";
      const replies = await this.getReplies(user.toString());
      if (replies.length === 0) {
        out += "  No replies found\n";
      }
      for (const reply of replies) {
        out += `  ${reply.question} - ${reply.answer}\n`;
      }
    }
    return out;
  }

  async createReply(user: string, reply: Reply) {
    const datePath = this.repliesForSpecificIdPath(user, reply.id);
    this.kv.set(datePath, reply);

    const questionPath = this.repliesBySpecificQuestionPath(
      user,
      reply.question,
    );
    const repliesForQuestion =
      await this.getRepliesByQuestion(user, reply.question) ??
        [];
    repliesForQuestion.push(reply);
    this.kv.set(questionPath, repliesForQuestion);
  }

  async getReplyById(user: string, id: string) {
    const path = this.repliesForSpecificIdPath(user, id);
    return await getKv(this.kv, path, Reply);
  }

  async getRepliesByQuestion(user: string, question: string) {
    const path = this.repliesBySpecificQuestionPath(user, question);
    const replies = await getKv(this.kv, path, z.array(Reply));
    return replies?.toSorted(byDate) ?? [];
  }

  async getReplies(user: string) {
    const replies = [];
    for await (
      const entry of this.kv.list({
        prefix: this.repliesByIdPath(user),
      })
    ) {
      const value = await getKv(this.kv, entry.key, Reply);
      if (value) {
        replies.push(value);
      }
    }
    return replies.toSorted(byDate);
  }

  async deleteReply(user: string, reply: Reply) {
    const datePath = this.repliesForSpecificIdPath(user, reply.id);
    await this.kv.delete(datePath);

    const questionPath = this.repliesBySpecificQuestionPath(
      user,
      reply.question,
    );
    let repliesForQuestion = await this.getRepliesByQuestion(
      user,
      reply.question,
    );
    repliesForQuestion =
      repliesForQuestion?.filter((r) =>
        r.date.getTime() !== reply.date.getTime() || r.answer !== reply.answer
      ) ?? [];
    if (repliesForQuestion.length === 0) {
      await this.kv.delete(questionPath);
      return;
    }
    await this.kv.set(questionPath, repliesForQuestion);
  }

  private repliesByQuestionPath(user: string): Deno.KvKey {
    return [user, "replies", "by question"];
  }

  private repliesByIdPath(user: string): Deno.KvKey {
    return [user, "replies", "by id"];
  }

  private repliesForSpecificIdPath(user: string, id: string): Deno.KvKey {
    return this.repliesByIdPath(user).concat(id);
  }

  private repliesBySpecificQuestionPath(
    user: string,
    question: string,
  ): Deno.KvKey {
    return this.repliesByQuestionPath(user).concat(question);
  }
}
