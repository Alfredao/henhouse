import React from "react";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// reactstrap components
import {Button, Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Progress, Row, Table,} from "reactstrap";
// layout for this page
import Admin from "layouts/Admin.js";
// core components

import Header from "components/Headers/Header.js";

const Dashboard = (props) => {

    return (
        <>
            <Header/>
            {/* Page content */}
            <Container className="mt--7" fluid>
                <Row className="mt-5">
                    <Col className="mb-5 mb-xl-0" xl="12">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <div className="col">
                                        <h3 className="mb-0">Galinheiro crypto game</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>Lorem ipsum dolor sit amet, consectetur adipisicing elit. At atque consequuntur cum dignissimos, ea eius fugiat illo illum ipsa iure magnam nemo, nobis omnis repellat ullam. Facere nostrum rem
                                voluptatibus?</CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Dashboard.layout = Admin;

export default Dashboard;
