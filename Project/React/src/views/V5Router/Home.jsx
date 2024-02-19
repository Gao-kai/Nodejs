import { Link } from "react-router-dom";
import { Button } from "antd";
import RouterView from "@/router/index";
import homeRoutes from "@/router/homeRoutes";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
function Home(props) {
  return (
    <>
      <h1>Home组件</h1>
      <div className="home-nav-box">
        <Button type="primary">
          <Link to="/home/workspace">去首页面板</Link>
        </Button>

        <Button type="primary">
          <Link to="/home/center">去个人中心</Link>
        </Button>
      </div>
      <div className="home-router-view">
        <RouterView routes={homeRoutes}></RouterView>
        {/* <Switch>
          <Redirect exact from="/home" to="/home/workspace"></Redirect>
          <Route path="/home/workspace" component={WorkSpace}></Route>
          <Route path="/home/center" component={UserCenter}></Route>
        </Switch> */}
      </div>
    </>
  );
}

export default Home;
