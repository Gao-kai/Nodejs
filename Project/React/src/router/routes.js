// import Home from "../views/V5Router/Home";
// import About from "../views/V5Router/About";
// import User from "../views/V5Router/User";
import homeRoutes from "./homeRoutes";
import { lazy } from "react";

/**
 * 1. redirect
 * 2. to
 * 3. from
 * 4. exact
 * 5. path
 * 6. component
 * 7. name
 * 8. meta
 * 9. children
 */
const routes = [
  {
    redirect: true,
    exact: true,
    from: "/",
    to: "/home",
  },
  {
    path: "/home",
    component: lazy(() => import("../views/V5Router/Home")),
    name: "Home",
    meta: {},
    children: homeRoutes,
  },
  {
    path: "/about",
    component: lazy(() => import("../views/V5Router/About")),
    name: "About",
    meta: {},
  },
  {
    path: "/user",
    component: lazy(() => import("../views/V5Router/User")),
    name: "User",
    meta: {},
  },
];

export default routes;
