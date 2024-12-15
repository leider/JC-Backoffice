import express from "express";
import { image, image_type } from "qr-image";
import { resToJson } from "../lib/commons/replies.js";
const app = express();

app.get("/wlan/", (req, res) => {
  const {
    type = "WPA",
    ssid,
    pass,
    hidden,
    outputformat = "svg",
  } = req.query as {
    type?: string;
    pass: string;
    ssid: string;
    hidden?: "true" | "false";
    outputformat?: image_type;
  };
  if (!ssid) {
    return resToJson(res, {
      query: {
        type: "WPA|WEP (WPA if empty) | WEP",
        ssid: "<Name of Network>",
        pass: "<Password>",
        hidden: "boolean (optional)",
        outputformat: "svg|pdf|png|eps",
      },
    });
  }
  const wifi = `WIFI:T:${type};S:${ssid ?? ""};P:${pass ?? ""};${hidden === "true" ? "H:true" : ""};`;
  const img = image(wifi, { type: outputformat });
  res.type(outputformat);
  img.pipe(res);
});

export default app;
