import React from "react";
import {Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";

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
                                        <h3 className="mb-0">Galinheiro crypto game</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <div className="position-relative overflow-hidden p-3 p-md-5 m-md-3 text-center bg-light">
                                        <div className="col-md-8 p-lg-5 mx-auto my-5">
                                            <h1 className="display-4 font-weight-normal">Galinheiro game</h1>
                                            <p className="lead font-weight-normal">
                                                Desfrute do nosso sistema econômico de token duplo, explore as arenas para
                                                rinhas de galo e ganhe uma renda diária com suas galinhas botando ovos.
                                            </p>
                                            <p className="lead font-weight-normal">
                                                Todos os personagens e itens são NFTs.
                                            </p>
                                            <p className="lead font-weight-normal">
                                                Recrute sua galinha agora e comece essa jornada épica sobre galinhas no metaverso!
                                            </p>
                                            <a className="btn btn-primary" href="#">Comece agora</a>
                                        </div>
                                    </div>
                                </Row>

                                <Row>
                                    <div className="col-md-7">
                                        <img src="/img/eggnest2.jpg" alt="eggnest2" width={"100%"}/>
                                    </div>
                                    <div className="col-md-5 pt-7">
                                        <h1>Quebre ovos e comece a jogar</h1>
                                        <p>Quebre um ovo e receba uma galinha aleatória. Você poderá receber galinhas
                                            caipiras, pretas ou de granja e os atributos de força, peso, velocidade,
                                            energia também serão surpresa. </p>
                                        <a className="btn btn-primary" href="#"><i className="fas fa-egg"/> Quebrar ovo</a>
                                    </div>
                                </Row>

                                <Row>
                                    <div className="col-md-5 pt-7">
                                        <h1>Colete ovos no galinheiro</h1>
                                        <p>Após colocar suas galinhas para trabalhar, você receberá ovos diariamente.
                                            Alguns ninhos são específicos para cada tipo de galinha e as recompensas
                                            podem variar. Essa tarefa precisa de atenção, se você não coletar os ovos,
                                            em 15 dias eles começam apodrecer e seu rendimento cairá para apenas 80%
                                            da produção diária</p>
                                        <a className="btn btn-primary" href="#"><i className="fas fa-warehouse"/> Ver galinheiros</a>
                                    </div>
                                    <div className="col-md-7">
                                        <img src="/img/heninnest.jpg" alt="heninnest" width={"100%"}/>
                                    </div>
                                </Row>

                                <Row>
                                    <div className="col-md-7">
                                        <img src="/img/fight2.jpg" alt="heninnest" width={"100%"}/>
                                    </div>
                                    <div className="col-md-5 pt-7">
                                        <h1>Vença batalhas na nossa arena PvP</h1>
                                        <p>Participe de nossa rinha de galos. Enfrente batalhas mortais para
                                            ganhar ovos e novos tokens. Cuidado para seu galo não morrer</p>
                                        <a className="btn btn-primary" href="#"><i className="fas fa-skull-crossbones"/> Visitar rinhas</a>
                                    </div>
                                </Row>
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