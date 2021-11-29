import React from "react";
import {Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";

const Faq = (props) => {
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
                                        <h3 className="mb-0">Minhas galinhas</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>

                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Faq.layout = Game;

export default Faq;
