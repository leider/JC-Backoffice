import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/rest/users/current", () => {
    console.log("Current User");
    return HttpResponse.json({
      id: "testuser",
      name: "Test User",
    });
  }),
  http.post("/refreshToken", ({ request, requestId, params }) => {
    return HttpResponse.json({
      token: "testuser",
    });
  }),
];
