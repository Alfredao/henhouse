import React from "react";

// react-bootstrap components
import {Button, Card, Col, Container, Row,} from "react-bootstrap";

function House() {
    return (
        <>
            <Container fluid>
                <Row>
                    <Col md="12">
                        <Card className="striped-tabled-with-hover">
                            <Card.Header>
                                <Card.Title as="h4">Galinheiros</Card.Title>
                                <p className="card-category">
                                    Local de colocar galinhas para farmar ovos
                                </p>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {[...Array(12).keys()].map(() => (
                                        <Col md={3}>
                                            <Card className="border-dark mb-3">
                                                <Card.Header>Missão</Card.Header>
                                                <Card.Body>
                                                    <h5 className="card-title mb-3" style={{fontSize: '22px'}}>Caipira</h5>
                                                </Card.Body>
                                                <Card.Footer>
                                                    <Button>Entrar</Button>
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default House;
