import React, {useState} from "react";
import {useLocation} from "react-router-dom";
import {Button, Container, Nav, Navbar, Dropdown} from "react-bootstrap";

import routes from "routes.js";

import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

let web3;

const providerOptions = {
    /* See Provider Options Section */
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: "c1e76cc7837d1e33623c1322e44ddec8",
        }
    },
};

const web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions // required
});


async function getChainId() {
    // Get connected chain id from Ethereum node
    return await web3.eth.getChainId();
}


function Header() {

    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState(0.0);
    const [connected, setConnected] = useState(false);

    async function connect() {
        web3 = new Web3(await web3Modal.connect());

        // Get list of accounts of the connected wallet
        const accounts = await web3.eth.getAccounts();

        // Go through all accounts and get their ETH balance
        const rowResolvers = accounts.map(async (address) => {
            const balance = await web3.eth.getBalance(address);
            // ethBalance is a BigNumber instance
            // https://github.com/indutny/bn.js/
            const ethBalance = web3.utils.fromWei(balance, "ether");

            setBalance(ethBalance);
        });

        // Because rendering account does its own RPC commucation
        // with Ethereum node, we do not want to display any results
        // until data for all accounts is loaded
        await Promise.all(rowResolvers);

        setConnected(true);
        setAccount(accounts[0]);

        //const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
    }

    async function disconnect() {
        setConnected(false);
        setAccount('');
    }

    const location = useLocation();
    const mobileSidebarToggle = (e) => {
        e.preventDefault();
        document.documentElement.classList.toggle("nav-open");

        const node = document.createElement("div");

        node.id = "bodyClick";
        node.onclick = function () {
            this.parentElement.removeChild(this);
            document.documentElement.classList.toggle("nav-open");
        };

        document.body.appendChild(node);
    };

    const getBrandText = () => {
        for (let i = 0; i < routes.length; i++) {
            if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
                return routes[i].name;
            }
        }
        return "Brand";
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container fluid>
                <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
                    <Button
                        variant="dark"
                        className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
                        onClick={mobileSidebarToggle}
                    >
                        <i className="fas fa-angle-double-right"/>
                    </Button>
                    <Navbar.Brand
                        href="#home"
                        onClick={(e) => e.preventDefault()}
                        className="mr-2"
                    >
                        {getBrandText()}
                    </Navbar.Brand>
                </div>
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
                    <span className="navbar-toggler-bar burger-lines"/>
                    <span className="navbar-toggler-bar burger-lines"/>
                    <span className="navbar-toggler-bar burger-lines"/>
                </Navbar.Toggle>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto" navbar>
                        <Nav.Item>
                            {connected ? <Button onClick={disconnect} className={"mt-2"}>Conectado a {account}</Button> : <Button onClick={connect} className={"mt-2"}>Conectar carteira</Button>}
                        </Nav.Item>
                        <Dropdown as={Nav.Item}>
                            <Dropdown.Toggle
                                aria-expanded={false}
                                aria-haspopup={true}
                                as={Nav.Link}
                                data-toggle="dropdown"
                                id="navbarDropdownMenuLink"
                                variant="default"
                                className="m-0"
                            >
                                <span className="no-icon">Português (BR)</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink">
                                <Dropdown.Item onClick={(e) => e.preventDefault()}>Português (BR)</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => e.preventDefault()}>English (US)</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
