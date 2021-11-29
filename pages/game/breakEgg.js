import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../components/Wallet/walletState";

import contractAbi from "../../contracts/HenHouseAbi.json";

const BreakEgg = (props) => {

    let selectedAccount = walletState(state => state.selectedAccount);

    function breakEgg() {

    }

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
                                        <h3 className="mb-0">Quebrar ovos</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <div className="container d-flex h-100">
                                    <Row className="align-self-center w-100">
                                        <div className="col-6 mx-auto">
                                            <div className="jumbotron">
                                                <h1>Consiga uma galinha agora</h1>
                                                <h4>Quebre um ovo e boa sorte</h4>
                                                <img style={{height: '400px', width: '100%', display: 'block'}} src="/eggnest.jpg"/>
                                                <p className="lead">Pague apenas 1 HEN e receba uma galinha com atributos aleatórios</p>
                                                <Button className="btn-lg btn-block" onClick={breakEgg}>ATIVAR HEN</Button>
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

BreakEgg.layout = Game;

export default BreakEgg;
