import create from "zustand"

export const walletState = create(set => ({
    balances: {},
    selectedAccount: undefined,
    network: undefined,
    secureProtocolError: false,
    clearAccountData: function () {
        this.balances = {};
        this.selectedAccount = undefined;
        this.network = undefined;
        this.secureProtocolError = false;
    }
}));