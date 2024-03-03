import * as postmark from "npm:postmark";
import { load } from "https://deno.land/std@0.217.0/dotenv/mod.ts";
import { questions } from "./src/questions.ts";
import { Email } from "./src/types.ts";
import { emailToRelpy } from "./src/email_to_reply.ts";
import { Db } from "./src/db.ts";

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
const replyTo = Deno.env.get("REPLY_TO_EMAIL");
if (!replyTo) {
  throw new Error("REPLY_TO_EMAIL is required");
}

const postmarkClient = new postmark.ServerClient(serverToken);
const kv = await Deno.openKv();
const db = new Db(kv);

Deno.cron("Send question by email", "0 17 * * *", async () => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];
  await postmarkClient.sendEmail({
    From: fromEmail,
    To: toEmail,
    ReplyTo: replyTo,
    Subject: "A question for you",
    TextBody: question,
  });
  console.log("Sent email: ", question);
});

Deno.serve(async (req: Request) => {
  if (req.url.endsWith("/webhook/inbound-email")) {
    if (req.body) {
      const bodyText = await new Response(req.body).text();
      const resultJson = JSON.parse(bodyText);
      const email = Email.parse(resultJson);
      const reply = emailToRelpy(email, fromEmail);

      await db.createReply(email.From, reply);
      console.log("Received email: ", reply);

      const textBody =
        `Got it! Response saved.\n\n${reply.question}\n${reply.answer}`;
      await postmarkClient.sendEmail({
        From: fromEmail,
        To: email.From,
        Subject: email.Subject,
        TextBody: textBody,
      });

      return new Response("Email processed", { status: 200 });
    } else {
      return new Response("No email provided", { status: 400 });
    }
  } else if (req.url.endsWith("/health")) {
    return new Response("OK", { status: 200 });
  } else if (req.url.endsWith("/data")) {
    const data = await db.toString();
    return new Response(data, { status: 200 });
  } else {
    return new Response("Not found", { status: 404 });
  }
});
