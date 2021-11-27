import React from "react";

// react-bootstrap components
import {Card, Col, Container, Row,} from "react-bootstrap";

function Market() {
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Mercado de galinhas</Card.Title>
                <p className="card-category">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam, aut impedit laboriosam magni minima officiis recusandae totam? Cumque expedita nisi non odit optio quae quo saepe sint soluta temporibus. Saepe!
                </p>
              </Card.Header>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Market;
