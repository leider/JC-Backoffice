import { LoginState, useAuth } from "@/commons/authConsts.ts";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import * as React from "react";

export default function InnerContent() {
  const { pathname, search } = useLocation();
  const { loginState } = useAuth();

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
    return <Outlet />;
  }
}
