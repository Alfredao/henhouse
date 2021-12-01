import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../states/walletState";
import Web3 from "web3";

import tokenJson from "../../artifacts/contracts/HenHouse.sol/HenHouse.json"
import nftJson from "../../artifacts/contracts/Hen.sol/Hen.json"

const OpenEgg = (props) => {

    const {provider, selectedAccount, balances} = walletState();
    const web3 = new Web3(provider);

    let token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);

    const mintGovToken = async function () {
        await token.methods.mint(
            selectedAccount,
            web3.utils.toWei('1000', 'ether')
        ).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setMintToken = async function () {
        await nft.methods.setHenToken(process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setEggPrice = async function () {
        await nft.methods.setEggPrice(web3.utils.toWei('1', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const openEgg = async function () {
        await nft.methods.safeMint(
            selectedAccount,
            "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/0"
        ).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const getTokenUri = async function (id) {
        await token.methods.tokenURI(id).call({
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
                                        <h3 className="mb-0">Quebrar ovos</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <div className="container d-flex h-100">
                                    <Row className="align-self-center w-100">
                                        <div className="col-6 mx-auto">
                                            <div className="jumbotron">
                                                <h1>Consiga uma galinha agora</h1>
                                                <h4>Quebre um ovo e boa sorte</h4>
                                                <img style={{height: '400px', width: '100%', display: 'block'}} src="/img/breakegg.jpg" alt={"break-egg"}/>
                                                <p className="lead">Pague apenas 1 HEN e receba uma galinha com atributos aleatórios</p>
                                                {/*<Button className="btn-lg btn-block" onClick={setMintToken}>Definir moeda de troca</Button>*/}
                                                {/*<Button className="btn-lg btn-block" onClick={setEggPrice}>Definir preço do ovo</Button>*/}
                                                <Button className="btn-lg btn-block" onClick={mintGovToken}>Receber tokens</Button>
                                                <Button className="btn-lg btn-block" onClick={openEgg}>Abrir ovo</Button>
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

OpenEgg.layout = Game;

export default OpenEgg;