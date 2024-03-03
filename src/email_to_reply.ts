import { Email, Reply } from "./types.ts";
import { ulid } from "https://deno.land/x/ulid/mod.ts";

export function emailToRelpy(email: Email, fromEmail: string): Reply {
  let question = "";
  let answer = "";
  email.TextBody.split("\n").forEach((line: string) => {
    line = line.trim();
    if ((line.startsWith("On ") && line.match(fromEmail)) || line === "") {
      // Skip
    } else if (line.startsWith(">")) {
      line = line.replace(">", "").trim();
      question += line + "\n";
    } else {
      answer += line + "\n";
    }
  });

  const reply: Reply = {
    id: ulid(),
    question: question.trim().replace(/\n+$/, ""),
    answer: answer.trim().replace(/\n+$/, ""),
    date: email.Date,
    who: email.From,
  };

  return Reply.parse(reply);
}
