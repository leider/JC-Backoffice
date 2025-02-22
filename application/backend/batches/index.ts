import * as SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

export type JobResult = { result?: (SMTPTransport.SentMessageInfo | undefined)[] | SMTPTransport.SentMessageInfo; error?: Error };
