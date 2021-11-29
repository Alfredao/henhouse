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
                                        <h3 className="mb-0">FAQ</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <div id="accordion">
                                    {[1, 2, 3].map((a, b) => {
                                        return <>
                                            <Card>
                                                <CardHeader>
                                                    <a href={"javascript:void(0);"} data-toggle="collapse" data-target="#collapse" aria-expanded="true" aria-controls="collapseOne"><h3>Como funciona?</h3></a>
                                                </CardHeader>

                                                <CardBody className="collapse show" id="collapse" aria-labelledby="heading" data-parent="#accordion">
                                                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum
                                                    eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt
                                                    sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable
                                                    VHS.
                                                </CardBody>
                                            </Card>
                                        </>
                                    })}
                                </div>
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
