import * as React from "react";
import { useMemo, useState } from "react";
import User from "jc-shared/user/user.ts";
import { Navigate, RouteObject } from "react-router-dom";
import JazzclubApp from "@/app/JazzclubApp.tsx";
import Login from "@/app/Login.tsx";
import Team from "@/components/team/Team.tsx";
import Veranstaltungen from "@/components/team/Veranstaltungen.tsx";
import BigKalender from "@/components/team/BigKalender.tsx";
import VeranstaltungComp from "@/components/veranstaltung/VeranstaltungComp.tsx";
import Preview from "@/components/veranstaltung/preview/Preview.tsx";
import VermietungComp from "@/components/vermietung/VermietungComp.tsx";
import Info from "@/components/team/Info.tsx";
import Users from "@/components/users/Users.tsx";
import Optionen from "@/components/options/Optionen.tsx";
import OrtePage from "@/components/options/OrtePage.tsx";
import Programmheft from "@/components/programmheft/Programmheft.tsx";
import KalenderPage from "@/components/options/KalenderPage.tsx";
import TerminePage from "@/components/options/TerminePage.tsx";
import Kassenbericht from "@/components/options/Kassenbericht.tsx";
import ImageOverview from "@/components/options/ImageOverview.tsx";
import MailRules from "@/components/mails/MailRules.tsx";
import MailingLists from "@/components/mails/MailingLists.tsx";
import SendMail from "@/components/mails/SendMail.tsx";
import Belege from "@/components/belege/Belege.tsx";
import WikiPage from "@/components/wiki/WikiPage.tsx";
import WikiSearchresults from "@/components/wiki/WikiSearchresults.tsx";

export type RouteState = {
  routes: RouteObject[];
  setCurrentUser: (user: User) => void;
};

const allRoutes: RouteObject[] = [
  {
    element: <JazzclubApp />,
    errorElement: <Navigate to={"/"} />,
    children: [
      {
        path: "/",
        element: <Navigate to={{ pathname: "/veranstaltungen", search: "zukuenftige" }} />,
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
        path: "/teamseite",
        element: <Navigate replace to="/team" />,
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
        path: "/veranstaltungen/:url",
        element: <VeranstaltungComp />,
      },
      {
        path: "/veranstaltungen/preview/:url",
        element: <Preview />,
      },
      {
        path: "/veranstaltung/:url",
        element: <VeranstaltungComp />,
      },
      {
        path: "/veranstaltung/preview/:url",
        element: <Preview />,
      },
      {
        path: "/vermietung/:url",
        element: <VermietungComp />,
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
        path: "/belege",
        element: <Belege />,
      },
      {
        path: "/wiki/:subdir/:page?",
        element: <WikiPage />,
      },
      {
        path: "/wiki/searchresults/:searchtext",
        element: <WikiSearchresults />,
      },
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

const kassePattern = ["veranstaltung/:url"].join("|");

const superuserPattern = ["/imageoverview"].join("|");
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
