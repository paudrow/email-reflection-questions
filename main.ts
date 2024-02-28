import * as postmark from "npm:postmark";
import { load } from "https://deno.land/std@0.217.0/dotenv/mod.ts";
import { questions } from "./questions.ts";

await load({ export: true });

const serverToken = Deno.env.get("POSTMARK_SERVER_TOKEN");
if (!serverToken) {
  throw new Error("POSTMARK_SERVER_TOKEN is required");
}
const toEmail = Deno.env.get("TO_EMAIL");
if (!toEmail) {
  throw new Error("TO_EMAIL is required");
}
const fromEmail = Deno.env.get("FROM_EMAIL");
if (!fromEmail) {
  throw new Error("FROM_EMAIL is required");
}

const client = new postmark.ServerClient(serverToken);

Deno.cron("send emails to reflect on", "* * * * *", async () => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];

  await client.sendEmail({
    From: fromEmail,
    To: toEmail,
    Subject: "Occasional Reflection Question",
    TextBody: question,
  });

  console.log("Sent email: ", question);
});
console.log("Cron job scheduled");
