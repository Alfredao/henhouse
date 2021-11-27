import React, { Component } from "react";
import { Container } from "react-bootstrap";

class Footer extends Component {
  render() {
    return (
      <footer className="footer px-0 px-lg-3">
        <Container fluid>
          <nav>
            <ul className="footer-menu">
              <li>
                <a href="/" onClick={(e) => e.preventDefault()}>
                  Home
                </a>
              </li>
            </ul>
            <p className="copyright text-center">
              © {new Date().getFullYear()}{" "}
              BISGO SOLUTIONS
            </p>
          </nav>
        </Container>
      </footer>
    );
  }
}

export default Footer;
