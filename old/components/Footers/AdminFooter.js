/*eslint-disable*/
import React from "react";

// reactstrap components
import {Container, Row, Col, Nav, NavItem, NavLink} from "reactstrap";

function Footer() {
    return (
        <footer className="footer">
            <Nav className="nav-footer justify-content-center">
                <NavItem className="mr-9">
                    $HEN Token Address: {process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS}
                </NavItem>
                <NavItem>
                    $EGG Token Address: {process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS}
                </NavItem>
            </Nav>
        </footer>
    );
}

export default Footer;
