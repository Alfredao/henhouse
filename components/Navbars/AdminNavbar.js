import React, {useEffect} from "react";
import Link from "next/link";
import {Button, Container, DropdownItem, DropdownMenu, DropdownToggle, Media, Nav, Navbar, UncontrolledDropdown,} from "reactstrap";
import Web3 from "web3";
import Web3Modal from "web3modal";
import * as evmChains from "evm-chains";

console.log('evmChains', evmChains)

let provider;
let web3Modal;

function AdminNavbar({brandText}) {

    const [secureProtocolError, setSecureProtocolError] = React.useState(false);
    const [network, setNetwork] = React.useState(undefined);
    const [selectedAccount, setSelectedAccount] = React.useState(undefined);
    const [balances, setBalances] = React.useState({});

    const clearAccountData = () => {
        setNetwork(undefined);
        setSelectedAccount(undefined);
        setBalances({});
    }

    /**
     * Setup the orchestra
     */
    const init = () => {

        console.log("Initializing example");
        console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

        // Check that the web page is run in a secure context,
        // as otherwise MetaMask won't be available
        // if (window.location.protocol !== 'https:') {
        //     // https://ethereum.stackexchange.com/a/62217/620
        //     setSecureProtocolError(true);
        //     return;
        // }

        // Tell Web3modal what providers we have available.
        // Built-in web browser provider (only one can exist as a time)
        // like MetaMask, Brave or Opera is added automatically by Web3modal
        let providerOptions = {};

        web3Modal = new Web3Modal({
            network: "mainnet", // optional
            cacheProvider: true, // optional
            providerOptions // required
        });

        console.log("Web3Modal instance is", web3Modal);
    }

    /**
     * Connect wallet button pressed.
     */
    const onConnect = async () => {

        console.log("Opening a dialog", web3Modal);
        try {
            provider = await web3Modal.connect();
        } catch (e) {
            console.log("Could not get a wallet connection", e);

            return;
        }

        // Subscribe to accounts change
        provider.on("accountsChanged", (accounts) => {
            fetchAccountData();
        });

        // Subscribe to chainId change
        provider.on("chainChanged", (chainId) => {
            fetchAccountData();
        });

        // Subscribe to networkId change
        provider.on("networkChanged", (networkId) => {
            fetchAccountData();
        });

        await refreshAccountData();
    }


    /**
     * Fetch account data for UI when
     * - User switches accounts in wallet
     * - User switches networks in wallet
     * - User connects wallet initially
     */
    const refreshAccountData = async () => {

        // If any current data is displayed when
        // the user is switching acounts in the wallet
        // immediate hide this data
        // document.querySelector("#connected").style.display = "none";
        // document.querySelector("#prepare").style.display = "block";

        // Disable button while UI is loading.
        // fetchAccountData() will take a while as it communicates
        // with Ethereum node via JSON-RPC and loads chain data
        // over an API call.
        // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
        await fetchAccountData(provider);
        // document.querySelector("#btn-connect").removeAttribute("disabled")
    }


    /**
     * Kick in the UI action after Web3modal dialog has chosen a provider
     */
    const fetchAccountData = async () => {

        // Get a Web3 instance for the wallet
        const web3 = new Web3(provider);

        console.log("Web3 instance is", web3);

        // Get connected chain id from Ethereum node
        const chainId = await web3.eth.getChainId();
        // Load chain information over an HTTP API
        const chainData = evmChains?.getChain(chainId);
        setNetwork(chainData.name);

        // Get list of accounts of the connected wallet
        const accounts = await web3.eth.getAccounts();

        // MetaMask does not give you all accounts, only the selected account
        console.log("Got accounts", accounts);
        setSelectedAccount(accounts[0]);

        // Go through all accounts and get their ETH balance
        const rowResolvers = accounts.map(async (address) => {
            const balance = await web3.eth.getBalance(address);

            // ethBalance is a BigNumber instance
            // https://github.com/indutny/bn.js/
            const ethBalance = web3.utils.fromWei(balance, "ether");
            const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);

            setBalances(balances => ({
                ...balances,
                [address]: humanFriendlyBalance,
            }));
        });

        // Because rendering account does its own RPC commucation
        // with Ethereum node, we do not want to display any results
        // until data for all accounts is loaded
        await Promise.all(rowResolvers);
    }


    /**
     * Disconnect wallet button pressed.
     */
    const onDisconnect = async () => {

        console.log("Killing the wallet connection", provider);

        // TODO: Which providers have close method?
        if (provider?.close) {
            await provider.close();

            // If the cached provider is not cleared,
            // WalletConnect will default to the existing session
            // and does not allow to re-scan the QR code with a new wallet.
            // Depending on your use case you may want or want not his behavir.
            await web3Modal.clearCachedProvider();
            provider = null;
        }

        clearAccountData();
    }

    useEffect(init);

    return (
        <>
            <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
                <Container fluid>
                    <Link href="#">
                        <a className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block">
                            {brandText}
                        </a>
                    </Link>
                    {selectedAccount ? <Button onClick={onDisconnect} className="mr-3 d-none d-md-flex ml-lg-auto">Conectado a {selectedAccount.substr(0, 5)}...{selectedAccount.substr(-4)}</Button> : <Button className="mr-3 d-none d-md-flex ml-lg-auto" onClick={onConnect}>Conectar à carteira</Button>}
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
