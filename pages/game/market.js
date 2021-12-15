import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUp, faDollarSign} from "@fortawesome/free-solid-svg-icons";

const Market = (props) => {

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
                                        <h3 className="mb-0">Itens listados</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    {[].map((hen, i) => <div className="col-md-3">
                                        <div className="card mb-4 box-shadow">
                                            <img className="card-img-top" style={{height: '300px', width: '100%', display: 'block'}}
                                                 src="/img/hen/black.jpg"
                                                 data-holder-rendered="true"/>
                                            <div className="card-body">
                                                <h3>GALINHA PRETA <small className={"text-muted mt-1 float-right"}> Level {hen.level}</small></h3>
                                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                                    <span className={"mr-3"}><strong>P /</strong> {hen.productivity}</span>
                                                    <span className={"mr-3"}><strong>R /</strong> {hen.endurance}</span>
                                                    <span className={"mr-3"}><strong>F /</strong> {hen.strength}</span>
                                                    <span className={"mr-3"}><strong>E /</strong> {hen.stamina}</span>
                                                    <span className={"mr-3"}><strong>S /</strong> {hen.health}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="btn-group">
                                                        <Button><FontAwesomeIcon icon={faArrowUp} /> TREINAR</Button>
                                                        <Button><FontAwesomeIcon icon={faDollarSign} /> VENDER</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Market.layout = Game;

export default Market;
