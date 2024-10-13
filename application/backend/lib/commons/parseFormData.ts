import { Request } from "express";
import { Form } from "multiparty";

export default async function parseFormData(req: Request) {
  const upload = (req1: Request) =>
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    new Promise<any[]>((resolve, reject) => {
      new Form().parse(req1, function (err, fields, files) {
        if (err) {
          return reject(err);
        }
        return resolve([fields, files]);
      });
    });

  return await upload(req);
}
