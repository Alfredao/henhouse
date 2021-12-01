import React from "react";
import Head from "next/head";
import App from "next/app";

import "assets/plugins/nucleo/css/nucleo.css";
import "assets/scss/nextjs-argon-dashboard.scss";
import "assets/css/global.css";

export default class MyApp extends App {
    static async getInitialProps({Component, router, ctx}) {
        let pageProps = {};

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx);
        }

        return {pageProps};
    }

    render() {
        const {Component, pageProps} = this.props;
        const Layout = Component.layout || (({children}) => <>{children}</>);

        return (
            <React.Fragment>
                <Head>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, shrink-to-fit=no"
                    />
                    <title>Hen House Crypto Game - Yield farm and PVP</title>
                </Head>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </React.Fragment>
        );
    }
}
