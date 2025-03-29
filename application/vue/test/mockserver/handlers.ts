import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/rest/users/current", () => {
    return HttpResponse.json({
      id: "testuser",
      name: "Test User",
    });
  }),
  http.post("/refreshToken", () => {
    return HttpResponse.json({
      token: "testuser",
    });
  }),
];
