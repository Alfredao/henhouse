import create from "zustand"

export const walletState = create(set => ({
    provider: undefined,
    web3: undefined,
    balances: {},
    selectedAccount: undefined,
    network: undefined,
    secureProtocolError: false,
    contracts: {

    },
    blockNumber : 0,
    clearAccountData: function () {
        this.balances = {};
        this.selectedAccount = undefined;
        this.network = undefined;
        this.web3 = undefined;
        this.provider = undefined;
        this.secureProtocolError = false;
    }
}));