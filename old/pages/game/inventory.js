import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {Alert} from "react-bootstrap";

const Inventory = (props) => {
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
                                        <h3 className="mb-0">Meus itens</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Alert variant="default">
                                    <Alert.Heading>Em breve</Alert.Heading>
                                    <p>
                                        Sistema em construção
                                    </p>
                                </Alert>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Inventory.layout = Game;

export default Inventory;
