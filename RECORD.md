# Record

## 2024-03-03

Done:

- Created Deno KV database accessors with tests.
- Able to send and receive emails with [Postmark](https://postmarkapp.com/).
  - Inbound email uses a [nGrok](https://ngrok.com/) tunnel for exposing the
    webhook to Postmark.
  - Domain is managed on [Vercel](https://vercel.com/).
  - Email is forwarded with [Forward Email](https://forwardemail.net/).
- Created a list of random questions to ask in the emails.

Next steps:

- [x] Create a server that
  1. Sends email on a cron job
  2. Saves replies to the KV database
  3. Sends a reply to the email
- [x] Create a web interface to view the replies.

Future work:

- [ ] Add the ability to configure the cron job from the web interface.
- [ ] Make the email better looking
- [ ] Add the ability to configure questions from the web interface.
- [ ] Use a real router like [oak](https://deno.land/x/oak) instead of the
      built-in `http` module.
