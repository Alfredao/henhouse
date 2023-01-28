import React, {useEffect} from "react";
import Link from "next/link";
import {Button, Container, DropdownItem, DropdownMenu, DropdownToggle, Media, Nav, Navbar, UncontrolledDropdown,} from "reactstrap";
import Wallet from "../Wallet/Wallet";

function AdminNavbar({brandText}) {
    return (
        <>
            <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
                <Container fluid>
                    <Link href="#">
                        <a className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block">
                            {brandText}
                        </a>
                    </Link>
                    <Wallet />
                    <Nav className="align-items-center d-none d-md-flex" navbar>
                        <UncontrolledDropdown nav>
                            <DropdownToggle className="pr-0" nav>
                                <Media className="align-items-center">
                                    <Media className="ml-2 d-none d-lg-block">
                                        <span className="mb-0 text-sm font-weight-bold">
                                          Português (BR)
                                        </span>
                                    </Media>
                                </Media>
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                                <Link href={'#'} onClick={(e) => e.preventDefault()}>
                                    <DropdownItem>
                                        <i className="fas fa-globe"/>
                                        <span>Português (BR)</span>
                                    </DropdownItem>
                                </Link>
                                <Link href={'#'} onClick={(e) => e.preventDefault()}>
                                    <DropdownItem>
                                        <i className="fas fa-globe"/>
                                        <span>English (US)</span>
                                    </DropdownItem>
                                </Link>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
}

export default AdminNavbar;
