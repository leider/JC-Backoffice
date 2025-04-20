import { Alert, Button, Space } from "antd";
import { useCallback } from "react";

/**
 * Simple Error Boundary acting as a catch-all when something went wrong while rendering.
 *
 * Doesn't implement componentDidCatch because the error will
 * bubble up either way, so we catch it alongside other errors
 * through `window.addEventListener('error', () => ..)`
 *
 */
import { isRouteErrorResponse } from "react-router";
import { useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  const reload = useCallback(() => window.location.reload(), []);

  if (isRouteErrorResponse(error)) {
    // eslint-disable-next-line no-console
    console.log({ error });
    return (
      <Space direction="vertical" style={{ margin: "10rem" }}>
        <Alert description={<p>Oops</p>} message="Fehler" type="error" />
        <Button onClick={reload}>Zurück</Button>
      </Space>
    );
  }
}
