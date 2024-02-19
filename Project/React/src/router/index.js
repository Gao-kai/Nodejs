import { Route, Switch, Redirect } from "react-router-dom";
import Page404 from "../views/V5Router/404";
import { Suspense } from "react";
const RouterView = (props) => {
  const { routes } = props;

  return (
    <Switch>
      {routes.map((route, index) => {
        const {
          redirect,
          to,
          from,
          exact,
          path,
          component: Component,
          name,
          meta,
        } = route;

        let routeProps = {};
        if (exact) routeProps.exact = exact;
        if (meta) routeProps.meta = meta;
        if (name) routeProps.name = name;

        if (redirect) {
          if (from) routeProps.from = from;
          return <Redirect key={index} {...routeProps} to={to}></Redirect>;
        }

        return (
          <Route
            key={index}
            {...routeProps}
            path={path}
            render={(props) => (
              <Suspense fallback={<>组件加载中</>}>
                <Component {...props}></Component>
              </Suspense>
            )}
          ></Route>
        );
      })}
      <Route path="*" component={Page404}></Route>
    </Switch>
  );
};

export default RouterView;
