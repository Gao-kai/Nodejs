// import WorkSpace from "../views/V5Router/home-subview/WorkSpace";
// import UserCenter from "../views/V5Router/home-subview/UserCenter";
import { lazy } from "react";

const homeRoutes = [
  {
    redirect: true,
    exact: true,
    from: "/home",
    to: "/home/workspace",
  },
  {
    path: "/home/workspace",
    component: lazy(() =>
      import(
        /* webpackChunkName: "HomeSub" */
        "../views/V5Router/home-subview/WorkSpace"
      )
    ),
    name: "WorkSpace",
    meta: {},
  },
  {
    path: "/home/center",
    component: lazy(() =>
      import(
        /* webpackChunkName: "HomeSub" */
        "../views/V5Router/home-subview/UserCenter"
      )
    ),
    name: "UserCenter",
    meta: {},
  },
];

export default homeRoutes;
