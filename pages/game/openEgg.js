import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Modal, ModalBody, ModalFooter, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../states/walletState";

import tokenJson from "../../artifacts/contracts/HenToken.sol/HenToken.json";
import summonerJson from "../../artifacts/contracts/HenSummoner.sol/HenSummoner.json";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import {henName} from "../../utils/henName";

const OpenEgg = (props) => {

    const {web3, selectedAccount} = walletState();
    const [modalOpen, setModalOpen] = React.useState(false);
    const [tokenBalance, setTokenBalance] = React.useState(0.0);
    const [summonPrice, setSummonPrice] = React.useState(0.0);
    const [hen, setHen] = React.useState({});

    let token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);
    let summoner = new web3.eth.Contract(summonerJson.abi, process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);

    useEffect(async function () {
        if (selectedAccount) {
            await token.methods.balanceOf(selectedAccount).call().then((r) => setTokenBalance(r));
            await summoner.methods.getSummonPrice().call().then((r) => setSummonPrice(r));
        }
    });

    const openEgg = async function () {

        if (tokenBalance < summonPrice) {
            return false;
        }

        await summoner.methods.summon().send({
            from: selectedAccount
        }).on('receipt', async function (receipt) {
            await nft.methods.getHenDetail(
                receipt.events.NewHen.returnValues.tokenId
            ).call().then((detail) => {
                setHen(detail);
                setModalOpen(true);
            });
        });
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
                                        <h3 className="mb-0">Abrir ovo</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <div className="container d-flex h-100">
                                    <Row className="align-self-center w-100">
                                        <div className="col-6 mx-auto">
                                            <div className="jumbotron">
                                                <h1>Consiga uma galinha agora</h1>
                                                <h4>Abra um ovo e boa sorte</h4>
                                                <img style={{height: '400px', width: '100%', display: 'block'}} src="/img/breakegg.jpg" alt={"break-egg"}/>
                                                <p className="lead">Pague apenas {web3.utils.fromWei(web3.utils.toBN(summonPrice), 'ether')} HEN e receba uma galinha com atributos aleatórios</p>
                                                <Button className="btn-lg btn-block" onClick={openEgg}>{tokenBalance >= summonPrice ? "Abrir ovo" : "Saldo insuficiente. Compre novos tokens"}</Button>
                                                <p className="lead mt-3 text-center">Você tem {web3.utils.fromWei(web3.utils.toBN(tokenBalance), 'ether')} HEN</p>
                                            </div>
                                        </div>
                                    </Row>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Modal toggle={() => setModalOpen(!modalOpen)} isOpen={modalOpen}>
                <div className=" modal-header">
                    <h1 className=" modal-title" id="exampleModalLabel">{henName(hen.genetic)}</h1>
                </div>
                <ModalBody>
                    <img src={"/img/hen/" + hen.genetic + ".jpg"} alt="hen" className={"img-fluid"}/>
                    <hr/>
                    <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                        <span className={"mr-2"}><strong>P /</strong> {hen.productivity}</span>
                        <span className={"mr-2"}><strong>R /</strong> {hen.endurance}</span>
                        <span className={"mr-2"}><strong>F /</strong> {hen.strength}</span>
                        <span className={"mr-2"}><strong>E /</strong> {hen.stamina}</span>
                        <span className={"mr-2"}><strong>S /</strong> {hen.health}</span>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" type="button" onClick={() => setModalOpen(!modalOpen)}>
                        Confirmar
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

OpenEgg.layout = Game;

export default OpenEgg;