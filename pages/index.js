import React from "react";
import Router from "next/router";

export default function Index() {
    React.useEffect(() => {
        Router.push("/game/dashboard");
    });

    return <div/>;
}
