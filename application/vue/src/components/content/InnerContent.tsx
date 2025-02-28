import { LoginState, useAuth } from "@/commons/authConsts.ts";
import { Navigate, Outlet, useLocation } from "react-router";
import * as React from "react";
import { Spin } from "antd";
import { useEffect, useRef } from "react";

export default function InnerContent() {
  const { pathname, search } = useLocation();
  const { loginState } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scroll({ top: 0 });
  });

  if (loginState === LoginState.UNKNOWN) {
    return <Spin size="large" />;
  }
  if (pathname !== "/login" && loginState !== LoginState.LOGGED_IN) {
    return (
      <Navigate
        to={{
          pathname: "/login",
          search: encodeURIComponent(pathname + (search ? search : "")),
        }}
      />
    );
  } else {
    return (
      <div ref={ref}>
        <Outlet />
      </div>
    );
  }
}
