import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import User from "jc-shared/user/user";
import Users from "../../../src/components/users/Users";
import { TestHarness, typeInto } from "../harness";

let capturedNewUser: Record<string, unknown> | undefined;

const existingUsers = [new User({ id: "admin", name: "Admin", gruppen: "superusers" })];

const server = setupServer(
  http.put("/rest/user", async ({ request }) => {
    capturedNewUser = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(capturedNewUser);
  }),
  http.get("/rest/users", () => HttpResponse.json(existingUsers)),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  capturedNewUser = undefined;
  window.scroll = vi.fn();
});

describe("Admin Benutzer – component test", () => {
  it("creates a new user via the NewUserModal", async () => {
    const user = userEvent.setup();

    render(
      <TestHarness allUsers={existingUsers}>
        <Users />
      </TestHarness>,
    );

    await waitFor(() => expect(screen.getByText("Übersicht über die User")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Neuer Benutzer"));

    await waitFor(() => {
      const modalTitle = document.querySelector(".ant-modal-title");
      expect(modalTitle?.textContent).toContain("Neuer Benutzer");
    });

    await typeInto(user, "#id", "testhelfer");
    await typeInto(user, "input#password", "testhelfer");
    await typeInto(user, "#name", "Testuser testhelfer");
    await typeInto(user, "#email", "testhelfer@google.com");
    await typeInto(user, "#tel", "01797591061");

    const okBtn = document.querySelector(".ant-modal-footer .ant-btn-primary") as HTMLButtonElement;
    expect(okBtn).toBeTruthy();
    await user.click(okBtn);

    await waitFor(() => expect(capturedNewUser).toBeDefined(), { timeout: 5000 });

    expect(capturedNewUser!.id).toBe("testhelfer");
    expect(capturedNewUser!.name).toBe("Testuser testhelfer");
    expect(capturedNewUser!.email).toBe("testhelfer@google.com");
  }, 60000);
});
