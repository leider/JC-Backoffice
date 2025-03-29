import { server } from "./vue/test/mockserver/node.js";

beforeAll(() => {
  console.log("setup server");
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
