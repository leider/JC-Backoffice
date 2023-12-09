/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, Method } from "axios";
import { Rider } from "jc-shared/rider/rider.ts";

type ContentType = "json" | "pdf" | "zip" | "other";

type FetchParams = {
  url: string;
  contentType: ContentType;
  method: Method;
  data?: any;
};

async function standardFetch(params: FetchParams) {
  const options: AxiosRequestConfig = {
    url: params.url,
    method: params.method,
    data: params.data,
    responseType: params.contentType !== "json" ? "blob" : "json",
  };
  const res = await axios(options);
  return res.data;
}

async function getForType(contentType: ContentType, url: string) {
  return standardFetch({ contentType, url, method: "GET" });
}

// Rider
export async function riderFor(url: string) {
  const result = await getForType("json", `/ridersrest/${url}`);
  return result ? new Rider(result) : undefined;
}

export async function saveRider(rider: Rider) {
  return standardFetch({
    method: "POST",
    url: "/ridersrest",
    data: rider,
    contentType: "json",
  });
}
