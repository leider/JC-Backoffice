import { Alert, Button, Space } from "antd";

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
  if (isRouteErrorResponse(error)) {
    // eslint-disable-next-line no-console
    console.log({ error });
    return (
      <Space direction="vertical" style={{ margin: "10rem" }}>
        <Alert type="error" message="Fehler" description={<p>Oops</p>} />
        <Button onClick={() => window.location.reload()}>{"Zurück"}</Button>
      </Space>
    );
  }
}
