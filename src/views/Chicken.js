import React from "react";

// react-bootstrap components
import {Card, Col, Container, Row,} from "react-bootstrap";

function Chicken() {
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Minhas galinhas</Card.Title>
                <p className="card-category">
                  Aqui as minhas galinhas
                </p>
              </Card.Header>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Chicken;
