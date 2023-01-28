import React from "react";
import {Card, CardBody, CardHeader, Col, Container, Media, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";
import {Alert} from "react-bootstrap";

const Dashboard = (props) => {
    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                <Row className="mt-5">
                    <Col className="mb-5 mb-xl-0" xl="12">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <div className="col">
                                        <h3 className="mb-0">Rinha de galos (Arena PvE)</h3>
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
                                <img src={"/img/fight.jpg"} alt={"rinha"} width={"100%"}/>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Dashboard.layout = Game;

export default Dashboard;