import { server } from "./vue/test/mockserver/node.js";

beforeAll(() => {
  console.log("setup server"); // eslint-disable-line no-console
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
