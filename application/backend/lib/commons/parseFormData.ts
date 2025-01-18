import { Request } from "express";
import { File, Form } from "multiparty";

export default async function parseFormData(req: Request) {
  const upload = (req1: Request) =>
    new Promise<{ fields: Record<string, string[] | undefined>; files: Record<string, File[] | undefined> }>((resolve, reject) => {
      new Form().parse(req1, function (err, fields, files) {
        if (err) {
          return reject(err);
        }
        return resolve({ fields, files });
      });
    });

  return await upload(req);
}
