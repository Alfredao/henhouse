import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../states/walletState";
import Web3 from "web3";

import nftJson from "../../artifacts/contracts/Hen.sol/Hen.json"
import tokenJson from "../../artifacts/contracts/HenHouse.sol/HenHouse.json"
import icoJson from "../../artifacts/contracts/HenHouseIco.sol/HenHouseIco.json"

const Admin = (props) => {

    const {provider, selectedAccount} = walletState();
    const web3 = new Web3(provider);

    let token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let ico = new web3.eth.Contract(icoJson.abi, process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS);

    const setIcoMintToken = async function () {
        console.log(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);
        await ico.methods.setHenToken(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleIco = async function () {
        await token.methods.grantRole(process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS, web3.utils.keccak256('MINTER_ROLE')).send({
            from: selectedAccount
        }).then((r) => console.log(r));

    };
    const getInWhitelist = async function () {
        await ico.methods.addWhitelistAddress('0xfae678bfd055cbc1094f9aca7fd205c3b16c2dca').send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const mintGovToken = async function () {
        await token.methods.mint(
            selectedAccount,
            web3.utils.toWei('5000', 'ether')
        ).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setMintToken = async function () {
        await nft.methods.setHenToken(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setEggPrice = async function () {
        await nft.methods.setEggPrice(web3.utils.toWei('500', 'ether')).send({
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
                                                <Button className="btn-lg btn-block" onClick={setIcoMintToken}>Definir moeda do ICO</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleIco}>Garantir permissão de gerar tokens pelo ICO</Button>
                                                <Button className="btn-lg btn-block" onClick={getInWhitelist}>Entrar na whitelist</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setMintToken}>Definir moeda do market</Button>
                                                <Button className="btn-lg btn-block" onClick={setEggPrice}>Definir preço do ovo</Button>
                                                <Button className="btn-lg btn-block" onClick={mintGovToken}>Receber tokens</Button>
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