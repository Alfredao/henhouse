import React from "react";
import {Route, Switch, useLocation} from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";

import routes from 'routes.js';

function Admin() {
    const location = useLocation();
    const mainPanel = React.useRef(null);

    const getRoutes = (routes) => {
        return routes.map((prop, key) => {
            if (prop.layout === "/game") {
                return (
                    <Route
                        path={prop.layout + prop.path}
                        render={(props) => <prop.component {...props} />}
                        key={key}
                    />
                );
            }

            return null;
        });
    };

    React.useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.scrollingElement.scrollTop = 0;

        mainPanel.current.scrollTop = 0;

        if (window.innerWidth < 993 && document.documentElement.className.indexOf("nav-open") !== -1) {
            document.documentElement.classList.toggle("nav-open");

            let element = document.getElementById("bodyClick");
            element.parentNode.removeChild(element);
        }
    }, [location]);

    return (
        <>
            <div className="wrapper">
                <Sidebar color={"black"} image={'assets/img/sidebar-3.jpg'} routes={routes}/>
                <div className="main-panel" ref={mainPanel}>
                    <AdminNavbar/>
                    <div className="content">
                        <Switch>{getRoutes(routes)}</Switch>
                    </div>
                    <Footer/>
                </div>
            </div>
        </>
    );
}

export default Admin;
