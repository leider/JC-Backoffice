import axios, { AxiosRequestConfig, Method } from "axios";
import { Rider } from "jc-shared/rider/rider.ts";

type FetchParams = {
  url: string;
  method: Method;
  data?: object;
};

async function standardFetch(params: FetchParams) {
  const options: AxiosRequestConfig = {
    url: params.url,
    method: params.method,
    data: params.data,
    responseType: "json",
  };
  const res = await axios(options);
  return res.data;
}

// Rider
export async function riderFor(url: string) {
  const result = await standardFetch({ url: `/ridersrest/${url}`, method: "GET" });
  return result ? new Rider(result) : undefined;
}

export async function saveRider(rider: Rider) {
  return standardFetch({ method: "POST", url: "/ridersrest", data: rider });
}
