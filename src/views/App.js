import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../assets/css/animate.min.css";
import "../assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "../assets/css/demo.css";

import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import AdminLayout from "../layouts/Admin";
import ErrorBoundary from "../classes/ErrorBoundary";

function App() {
    return (
        <>
            <ErrorBoundary>
                <BrowserRouter>
                    <Switch>
                        <Route path="/game" render={(props) => <AdminLayout {...props} />}/>
                        <Redirect from="/" to="/game/dashboard"/>
                    </Switch>
                </BrowserRouter>
            </ErrorBoundary>
        </>
    );
}

export default App;