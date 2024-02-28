# README

This project is a trial for cron jobs on [Deno Deploy](https://deno.com/deploy).
It sends an email every Wednesday and Friday at 1pm, Texas time.

It uses [Postmark](https://postmarkapp.com/) to send the emails.

## Usage

1. Setup a Postmark account and get an API key.

1. Copy the `.env.example` file to `.env` and fill in the required fields.

1. Deploy the project to Deno Deploy.
