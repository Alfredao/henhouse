import React from "react";

// react-bootstrap components
import {Button, Card, Col, Container, Row,} from "react-bootstrap";

const houses = [
    {
        name: 'Primeira ninhada',
        henType: 'Todas',
    },
    {
        name: 'Capim',
        henType: 'Caipira',
    },
    {
        name: 'Estaleiro',
        henType: 'Granja',
    },
    {
        name: 'Gaiola',
        henType: 'Codorna',
    },
];

function House() {
    return (
        <>
            <Container fluid>
                <Row>
                    <Col md="12">
                        <Card className="strpied-tabled-with-hover">
                            <Card.Header>
                                <Card.Title as="h4">Galinheiros</Card.Title>
                                <p className="card-category">
                                    Local de colocar galinhas para farmar ovos
                                </p>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {houses.map(house => (
                                        <Col md={3}>
                                            <Card className="border-dark mb-3">
                                                <Card.Header>{house.name}</Card.Header>
                                                <Card.Body>
                                                    <h5 className="card-title mb-3" style={{fontSize: '22px'}}>{house.henType}</h5>
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
