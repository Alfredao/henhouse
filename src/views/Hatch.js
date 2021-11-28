import React from "react";

// react-bootstrap components
import {
    Badge,
    Button,
    Card,
    Navbar,
    Nav,
    Table,
    Container,
    Row,
    Col,
} from "react-bootstrap";

function Hatch() {
    return (
        <>
            <Container fluid>
                <Row>
                    <Col md="12">
                        <Card className="striped-tabled-with-hover">
                            <Card.Header>
                                <Card.Title as="h4">Chocar ovo</Card.Title>
                                <p className="card-category">
                                    Choque um ovo e receba uma galinha
                                </p>
                            </Card.Header>
                            <Card.Body>
                                <p className="new-hen">
                                    Receba uma galinha agora Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem cumque delectus fugit id laborum, libero modi, quia recusandae sint suscipit tempora voluptates voluptatibus voluptatum.
                                    Culpa doloribus incidunt iusto provident repudiandae!
                                </p>
                                <Button>Receber</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Hatch;
