import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../states/walletState";
import Web3 from "web3";

import henJson from "../../artifacts/contracts/Hen.sol/Hen.json"

const OpenEgg = (props) => {

    const {provider, selectedAccount} = walletState();
    const web3 = new Web3(provider);

    let contract = new web3.eth.Contract(henJson.abi, '0xADe6e248d3Bc169cE8d1E2fd57C9Cf60c068d3d4');

    const breakEgg = async function () {

        await contract.methods.safeMint(
            selectedAccount,
            "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/0"
        ).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const getUri = async function (id) {
        await contract.methods.tokenURI(id).call({
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
                                                <Button className="btn-lg btn-block" onClick={breakEgg}>AUTORIZAR CARTEIRA</Button>
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