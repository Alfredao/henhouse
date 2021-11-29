/*eslint-disable*/
import React from "react";

// reactstrap components
import {Container, Row, Col, Nav, NavItem, NavLink} from "reactstrap";

function Footer() {
    return (
        <footer className="footer">
            <Nav className="nav-footer justify-content-center">
                <NavItem className="mr-9">
                    $HEN Token Address: 0x9999999999999999999999999999999999999999
                </NavItem>
                <NavItem>
                    $EGG Token Address: 0x9999999999999999999999999999999999999999
                </NavItem>
            </Nav>
        </footer>
    );
}

export default Footer;
