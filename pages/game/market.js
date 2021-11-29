import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";

const Market = (props) => {

    let galinhas = [
        {
            name: 'GALINHA PRETA',
            image: '/img/hen/black.jpg',
        },
        {
            name: 'GALINHA DE GRANJA',
            image: '/img/hen/white.jpg',
        },
        {
            name: 'GALINHA CAIPIRA',
            image: '/img/hen/brown.jpg',
        },
    ];

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
                                    {galinhas.map((hen, i) => <div className="col-md-3">
                                        <div className="card mb-4 box-shadow">
                                            <img className="card-img-top" style={{height: '300px', width: '100%', display: 'block'}}
                                                 src={hen.image}
                                                 data-holder-rendered="true"/>
                                            <div className="card-body">
                                                <h3>{hen.name} <small className={"text-muted mt-1 float-right"}> Level 1</small></h3>
                                                <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                                <hr/>
                                                <p className="card-text">
                                                    {["A", "B", "C", "D", "E"].map((attr, i) => <span className={"mr-4"}>{attr} <strong>99</strong></span>)}
                                                </p>
                                                <hr/>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="btn-group">
                                                        <Button>COMPRAR</Button>
                                                    </div>
                                                    <span className="text-muted"><i className="fab fa-bitcoin"/> 8.5 HEN</span>
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
