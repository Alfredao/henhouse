import React from "react";

import {Card, Col, Container, Row,} from "react-bootstrap";

function FAQ() {
    return (
        <>
            <Container fluid>
                <Row>
                    <Col md="12">
                        <Card className="striped-tabled-with-hover">
                            <Card.Header>
                                <Card.Title as="h4">FAQ</Card.Title>
                                <p className="card-category">
                                    Perguntas mais respondidas
                                </p>
                            </Card.Header>
                            <Card.Body>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default FAQ;
