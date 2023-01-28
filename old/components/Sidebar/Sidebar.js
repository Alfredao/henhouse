import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import React from "react";
import Link from "next/link";
import {useRouter} from "next/router";
import {PropTypes} from "prop-types";
import {Button, Col, Collapse, Container, Nav, Navbar, NavbarBrand, NavItem, NavLink, Row, UncontrolledDropdown,} from "reactstrap";

function Sidebar(props) {
    // used for checking current route
    const router = useRouter();
    const [collapseOpen, setCollapseOpen] = React.useState(false);

    // verifies if routeName is the one active (in browser input)
    const activeRoute = (routeName) => {
        return router.route.indexOf(routeName) > -1;
    };

    // toggles collapse between opened and closed (true/false)
    const toggleCollapse = () => {
        setCollapseOpen(!collapseOpen);
    };

    // closes the collapse
    const closeCollapse = () => {
        setCollapseOpen(false);
    };

    // creates the links that appear in the left menu / Sidebar
    const createLinks = (routes) => {
        return routes.map((prop, key) => {
            return (
                <NavItem key={key} active={activeRoute(prop.layout + prop.path)}>
                    <Link href={prop.layout + prop.path}>
                        <NavLink href={prop.layout + prop.path} active={activeRoute(prop.layout + prop.path)} onClick={closeCollapse}>
                            <FontAwesomeIcon icon={prop.icon} />
                            <span className="ml-3">{prop.name}</span>
                        </NavLink>
                    </Link>
                </NavItem>
            );
        });
    };

    const {routes} = props;

    return (
        <Navbar className="navbar-vertical fixed-left navbar-light bg-white" expand="md" id="sidenav-main">
            <Container fluid>
                {/* Toggler */}
                <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
                    <span className="navbar-toggler-icon"/>
                </button>
                {/* Brand */}
                <NavbarBrand href="/" className="pt-0">
                    <i className="fas fa-crow"/>
                    <p>HEN HOUSE</p>
                </NavbarBrand>
                {/* User */}
                <Nav className="align-items-center d-md-none">
                    <UncontrolledDropdown nav>
                        <Button>Conectar</Button>
                    </UncontrolledDropdown>
                </Nav>
                {/* Collapse */}
                <Collapse navbar isOpen={collapseOpen}>
                    <div className="navbar-collapse-header d-md-none">
                        <Row>
                            <Col className="collapse-brand" xs="6">HEN HOUSE</Col>
                            <Col className="collapse-close" xs="6">
                                <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
                                    <span/>
                                    <span/>
                                </button>
                            </Col>
                        </Row>
                    </div>
                    {/* Navigation */}
                    <Nav navbar>{createLinks(routes)}</Nav>
                    {/* Divider */}
                    <hr className="my-3"/>
                </Collapse>
            </Container>
        </Navbar>
    );
}

Sidebar.defaultProps = {
    routes: [{}],
};

Sidebar.propTypes = {
    // links that will be displayed inside the component
    routes: PropTypes.arrayOf(PropTypes.object),
};

export default Sidebar;