import React, {useEffect} from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import {Button} from "reactstrap";
import {walletState} from "../../states/walletState";

let web3Modal;

function Wallet() {

    let selectedAccount = walletState(state => state.selectedAccount);

    /**
     * Setup the orchestra
     */
    const init = () => {
        // Check that the web page is run in a secure context,
        // as otherwise MetaMask won't be available
        if (window.location.protocol !== 'https:') {
            // https://ethereum.stackexchange.com/a/62217/620
            walletState.setState({secureProtocolError: true});
        }

        // Tell Web3modal what providers we have available.
        // Built-in web browser provider (only one can exist as a time)
        // like MetaMask, Brave or Opera is added automatically by Web3modal
        let providerOptions = {};

        web3Modal = new Web3Modal({
            network: "mainnet", // optional
            cacheProvider: true, // optional
            providerOptions // required
        });
    }

    /**
     * Connect wallet button pressed.
     */
    const onConnect = async () => {

        try {
            let provider = await web3Modal.connect();

            // Subscribe to accounts change
            provider.on("accountsChanged", (accounts) => {
                fetchAccountData(provider);
            });

            // Subscribe to chainId change
            provider.on("chainChanged", (chainId) => {
                fetchAccountData(provider);
            });

            // Subscribe to networkId change
            provider.on("networkChanged", (networkId) => {
                fetchAccountData(provider);
            });

            await refreshAccountData(provider);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Disconnect wallet button pressed.
     */
    const onDisconnect = async () => {

        let provider = walletState(state => state.provider);

        // TODO: Which providers have close method?
        if (provider?.close) {
            await provider.close();

            // If the cached provider is not cleared,
            // WalletConnect will default to the existing session
            // and does not allow to re-scan the QR code with a new wallet.
            // Depending on your use case you may want or want not his behavir.
            await web3Modal.clearCachedProvider();

            walletState.setState({provider: undefined});
        }

        clearAccountData();
    }

    /**
     * Fetch account data for UI when
     * - User switches accounts in wallet
     * - User switches networks in wallet
     * - User connects wallet initially
     */
    const refreshAccountData = async (provider) => {

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
    const fetchAccountData = async (provider) => {

        // Save provider to state
        walletState.setState({provider: provider});

        // Get a Web3 instance for the wallet
        const web3 = new Web3(provider);
        walletState.setState({web3: web3});

        // Get connected chain id from Ethereum node
        const chainId = await web3.eth.getChainId();
        walletState.setState({network: chainId});

        // Get list of accounts of the connected wallet
        const accounts = await web3.eth.getAccounts();

        // MetaMask does not give you all accounts, only the selected account
        walletState.setState({selectedAccount: accounts[0]});

        // Go through all accounts and get their ETH balance
        const rowResolvers = accounts.map(async (address) => {
            const balance = await web3.eth.getBalance(address);

            // ethBalance is a BigNumber instance
            // https://github.com/indutny/bn.js/
            const ethBalance = web3.utils.fromWei(balance, "ether");
            const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);


            walletState.setState({
                balances: (balances => ({
                    ...balances,
                    [address]: humanFriendlyBalance,
                }))
            });
        });

        // Because rendering account does its own RPC commucation
        // with Ethereum node, we do not want to display any results
        // until data for all accounts is loaded
        await Promise.all(rowResolvers);
    }

    const clearAccountData = () => {
        return false;

        // walletState(state => state.clearAccountData);
    }

    useEffect(async function () {
        init();

        await onConnect();
    });

    return (
        <>
            {selectedAccount
                ? <Button onClick={onDisconnect} className="mr-3 d-none d-md-flex ml-lg-auto">Conectado a {selectedAccount.substr(0, 5)}...{selectedAccount.substr(-4)}</Button>
                : <Button className="mr-3 d-none d-md-flex ml-lg-auto" onClick={onConnect}>Conectar à carteira</Button>
            }
        </>
    );
}

export default Wallet;
