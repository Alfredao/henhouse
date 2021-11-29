import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Admin from "layouts/Admin.js";
import Header from "components/Headers/Header.js";

const Hatch = (props) => {

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
                                        <h3 className="mb-0">Chocar ovos</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <div className="container d-flex h-100">
                                    <Row className="align-self-center w-100">
                                        <div className="col-6 mx-auto">
                                            <div className="jumbotron">
                                                <h1>Consiga uma galinha agora</h1>
                                                <img style={{height: '400px', width: '100%', display: 'block'}} src="/hatch.jpg"/>
                                                <p className="lead">Pague apenas 1 HEN e receba uma galinha com atributos aleatórios</p>
                                                <Button className="btn-lg btn-block">ATIVAR HEN</Button>
                                            </div>
                                        </div>
                                    </Row>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Hatch.layout = Admin;

export default Hatch;
