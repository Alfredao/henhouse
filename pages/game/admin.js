import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../states/walletState";
import Web3 from "web3";

import tokenJson from "../../artifacts/contracts/HenToken.sol/HenToken.json"
import summonerJson from "../../artifacts/contracts/HenSummoner.sol/HenSummoner.json"
import icoJson from "../../artifacts/contracts/HenHouseIco.sol/HenHouseIco.json"
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json"
import marketJson from "../../artifacts/contracts/Marketplace.sol/Marketplace.json"
import houseJson from "../../artifacts/contracts/HenHouse.sol/HenHouse.json"

const Admin = (props) => {

    const {provider, selectedAccount} = walletState();
    const web3 = new Web3(provider);

    let token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);
    let summoner = new web3.eth.Contract(summonerJson.abi, process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS);
    let market = new web3.eth.Contract(marketJson.abi, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS);
    let ico = new web3.eth.Contract(icoJson.abi, process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let house = new web3.eth.Contract(houseJson.abi, process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS);

    const setHenToken = async function () {
        await ico.methods.setHenToken(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleMintIco = async function () {
        await token.methods.grantRole(process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS, web3.utils.keccak256('MINTER_ROLE')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const addWhitelistAddress = async function () {
        await ico.methods.addWhitelistAddress(selectedAccount).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const sendBNB = async function () {
        web3.eth.sendTransaction({
            from: selectedAccount,
            to: process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS,
            value: web3.utils.toWei("0.1", "ether")
        });
    };

    const setSummonToken = async function () {
        await summoner.methods.setHenToken(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setSummonPrice = async function () {
        await summoner.methods.setSummonPrice(web3.utils.toWei('1', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setHen = async function () {
        await summoner.methods.setHen(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleMintNft = async function () {
        await nft.methods.grantRole(process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS, web3.utils.keccak256('MINTER_ROLE')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setMarketToken = async function () {
        await market.methods.setHenToken(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const createHenHouse = async function () {
        await house.methods.createHouse(1, 50).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await house.methods.createHouse(2, 61).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await house.methods.createHouse(3, 61).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await house.methods.createHouse(4, 61).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setHouseHen = async function () {
        await house.methods.setHen(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    return (
        <>
            <Header/>
            {/* Page content */}
            <Container className="mt--7" fluid>
                <Row className="mt-5">
                    <Col className="mb-5 mb-xl-0" xl="12">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <div className="col">
                                        <h3 className="mb-0">Admin</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <div className="container d-flex h-100">
                                    <Row className="align-self-center w-100">
                                        <div className="col-6 mx-auto">
                                            <div className="jumbotron">
                                                {/*<Button className="btn-lg btn-block" onClick={addWhitelistAddress}>Entrar na whitelist</Button>*/}
                                                <Button className="btn-lg btn-block" onClick={sendBNB}>Enviar 0.1 BNB</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setHenToken}>Definir moeda do ICO</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleMintIco}>Garantir permissão de gerar tokens pelo ICO</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setSummonToken}>Definir moeda de summon</Button>
                                                <Button className="btn-lg btn-block" onClick={setSummonPrice}>Definir preço do summon</Button>
                                                <Button className="btn-lg btn-block" onClick={setHen}>Definir item para summon</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleMintNft}>Garantir permissão de summon</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setMarketToken}>Definir moeda do market</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={createHenHouse}>Criar galinheiro</Button>
                                                <Button className="btn-lg btn-block" onClick={setHouseHen}>Definir galinhas do galinheiro</Button>
                                            </div>
                                        </div>
                                    </Row>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Admin.layout = Game;

export default Admin;