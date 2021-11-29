import React, {Component} from "react";
import Router from "next/router";

export default function _error() {
    React.useEffect(() => {
        Router.push("/game/dashboard");
    });

    return <div/>;
}
