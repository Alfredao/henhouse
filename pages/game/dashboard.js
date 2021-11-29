import React from "react";
import {Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";

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

Dashboard.layout = Game;

export default Dashboard;
