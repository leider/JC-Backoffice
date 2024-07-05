import * as React from "react";
import { useMemo, useState } from "react";
import User from "jc-shared/user/user.ts";
import { Navigate, RouteObject } from "react-router-dom";
import JazzclubApp from "@/app/JazzclubApp.tsx";
import Login from "@/app/Login.tsx";
import Team from "@/components/team/Team.tsx";
import Veranstaltungen from "@/components/team/Veranstaltungen.tsx";
import BigKalender from "@/components/team/BigKalender.tsx";
import Preview from "@/components/konzert/preview/Preview.tsx";
import VermietungComp from "@/components/vermietung/VermietungComp.tsx";
import Info from "@/components/team/Info.tsx";
import Users from "@/components/users/Users.tsx";
import Optionen from "@/components/options/Optionen.tsx";
import OrtePage from "@/components/options/OrtePage.tsx";
import Programmheft from "@/components/programmheft/Programmheft.tsx";
import KalenderPage from "@/components/options/KalenderPage.tsx";
import TerminePage from "@/components/options/TerminePage.tsx";
import Kassenbericht from "@/components/options/Kassenbericht.tsx";
import ImageOverview from "@/components/options/imageoverview/ImageOverview.tsx";
import MailRules from "@/components/mails/MailRules.tsx";
import MailingLists from "@/components/mails/MailingLists.tsx";
import SendMail from "@/components/mails/SendMail.tsx";
import WikiPage from "@/components/wiki/WikiPage.tsx";
import WikiSearchresults from "@/components/wiki/WikiSearchresults.tsx";
import { ErrorBoundary } from "@/router/ErrorBoundary.tsx";
import { History } from "@/components/history/History.tsx";
import KonzertComp from "@/components/konzert/KonzertComp.tsx";
import PreviewVermietung from "@/components/vermietung/preview/PreviewVermietung.tsx";

export type RouteState = {
  routes: RouteObject[];
  setCurrentUser: (user: User) => void;
};

const allRoutes: RouteObject[] = [
  {
    element: <JazzclubApp />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <Navigate to={{ pathname: "/veranstaltungen" }} />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/team",
        element: <Team />,
      },
      {
        path: "/veranstaltungen",
        element: <Veranstaltungen />,
      },
      {
        path: "/kalenderuebersicht",
        element: <BigKalender />,
      },
      {
        path: "/konzert/:url",
        element: <KonzertComp />,
      },
      {
        path: "/veranstaltung/:url",
        element: <KonzertComp />,
      },
      {
        path: "/konzert/preview/:url",
        element: <Preview />,
      },
      {
        path: "/veranstaltung/preview/:url",
        element: <KonzertComp />,
      },
      {
        path: "/vermietung/:url",
        element: <VermietungComp />,
      },
      {
        path: "/vermietung/preview/:url",
        element: <PreviewVermietung />,
      },
      {
        path: "/team/:monatJahr",
        element: <Info />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/optionen",
        element: <Optionen />,
      },
      {
        path: "/orte",
        element: <OrtePage />,
      },
      {
        path: "/programmheft",
        element: <Programmheft />,
      },
      {
        path: "/kalender",
        element: <KalenderPage />,
      },
      {
        path: "/termine",
        element: <TerminePage />,
      },
      {
        path: "/kassenbericht",
        element: <Kassenbericht />,
      },
      {
        path: "/imageoverview",
        element: <ImageOverview />,
      },
      {
        path: "/mailrules",
        element: <MailRules />,
      },
      {
        path: "/mailinglists",
        element: <MailingLists />,
      },
      {
        path: "/sendmail",
        element: <SendMail />,
      },
      {
        path: "/wiki/:subdir/:page?",
        element: <WikiPage />,
      },
      {
        path: "/wiki/searchresults/:searchtext",
        element: <WikiSearchresults />,
      },
      { path: "/history", element: <History /> },
      {
        path: "/*",
        element: <Navigate replace to="/" />,
      },
    ],
  },
];

const orgaTeamPattern = [
  "^/$",
  "vermietung",
  "veranstaltungen/:url",
  "konzert/:url",
  "veranstaltung/:url",
  "kalenderuebersicht",
  "optionen",
  "orte",
  "/programmheft",
  "/kalender",
  "/termine",
  "/kassenbericht",
  "/mailrules",
  "/mailinglists",
  "/sendmail",
].join("|");

const kassePattern = ["konzert/:url", "vermietung/preview"].join("|");

const superuserPattern = ["/imageoverview", "/history"].join("|");
export function useCreateRouteState(): RouteState {
  const [currentUser, setCurrentUser] = useState<User>(new User({}));
  const routes = useMemo(() => {
    const isOrgaTeam = currentUser.id ? currentUser.accessrights.isOrgaTeam : true;
    const isSuperuser = currentUser.id ? currentUser.accessrights.isSuperuser : true;
    const isKasse = currentUser.id ? currentUser.accessrights.isAbendkasse : true;
    const newChildren =
      allRoutes[0].children?.filter((route) => {
        const currentPath = route.path;
        if (new RegExp(kassePattern).test(currentPath || "")) {
          return isKasse;
        }
        if (new RegExp(orgaTeamPattern).test(currentPath || "")) {
          return isOrgaTeam;
        }
        if (new RegExp(superuserPattern).test(currentPath || "")) {
          return isSuperuser;
        }
        return true;
      }) || [];
    if (!isOrgaTeam) {
      newChildren.push({
        path: "/",
        element: <Navigate to={{ pathname: "/team" }} />,
      });
    }

    const root = { ...allRoutes[0] };
    root.children = newChildren;
    return [root];
  }, [currentUser]);
  return { routes, setCurrentUser };
}
