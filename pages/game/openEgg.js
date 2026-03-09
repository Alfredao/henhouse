import React, {useEffect} from "react";
import {Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, Row} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../states/walletState";

import tokenJson from "../../artifacts/contracts/HenToken.sol/HenToken.json";
import summonerJson from "../../artifacts/contracts/HenSummoner.sol/HenSummoner.json";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import {henName} from "../../utils/henName";

const OpenEgg = () => {
    const {web3, selectedAccount} = walletState();
    const [modalOpen, setModalOpen] = React.useState(false);
    const [tokenBalance, setTokenBalance] = React.useState(0.0);
    const [summonPrice, setSummonPrice] = React.useState(0.0);
    const [allowance, setAllowance] = React.useState(0);
    const [hen, setHen] = React.useState({});

    let token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);
    let summoner = new web3.eth.Contract(summonerJson.abi, process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);

    useEffect(async function () {
        if (selectedAccount) {
            await token.methods.balanceOf(selectedAccount).call().then((r) => setTokenBalance(r));
            await summoner.methods.getSummonPrice().call().then((r) => setSummonPrice(r));
            await token.methods.allowance(selectedAccount, process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS).call().then((r) => setAllowance(r));
        }
    });

    const approveToken = async function () {
        await token.methods.approve(process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS, web3.utils.toWei('1000000', 'ether'))
            .send({from: selectedAccount}).then(() => {
                token.methods.allowance(selectedAccount, process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS).call().then((r) => setAllowance(r));
            });
    };

    const openEgg = async function () {
        if (tokenBalance < summonPrice) return false;
        await summoner.methods.summon().send({from: selectedAccount}).on('receipt', async function (receipt) {
            await nft.methods.getHenDetail(receipt.events.NewHen.returnValues.tokenId).call().then((detail) => {
                setHen(detail);
                setModalOpen(true);
            });
        });
    };

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="hh-card text-center">
                            <CardBody className="p-5">
                                <h2 style={{fontWeight: 800, marginBottom: '0.5rem'}}>Consiga uma galinha agora</h2>
                                <p className="hh-text-muted mb-4">Abra um ovo e boa sorte!</p>
                                <img style={{maxHeight: '300px', width: '100%', objectFit: 'cover', borderRadius: '12px'}}
                                     src="/img/breakegg.jpg" alt={"break-egg"} className="mb-4"/>

                                <div className="d-flex justify-content-center mb-4" style={{gap: '2rem'}}>
                                    <div>
                                        <div className="hh-stat-label">Preco</div>
                                        <span className="hh-price-tag">{web3.utils.fromWei(web3.utils.toBN(summonPrice), 'ether')} HEN</span>
                                    </div>
                                    <div>
                                        <div className="hh-stat-label">Seu saldo</div>
                                        <span style={{fontWeight: 700}}>{web3.utils.fromWei(web3.utils.toBN(tokenBalance), 'ether')} HEN</span>
                                    </div>
                                </div>

                                {parseInt(allowance.toString()) >= parseInt(summonPrice.toString()) ?
                                    <button className="hh-btn hh-btn-primary btn-block" style={{padding: '0.75rem', fontSize: '1.1rem'}} onClick={openEgg}>
                                        {tokenBalance >= summonPrice ? "Abrir ovo" : "Saldo insuficiente"}
                                    </button> :
                                    <button className="hh-btn hh-btn-primary btn-block" style={{padding: '0.75rem', fontSize: '1.1rem'}} onClick={approveToken}>
                                        Autorizar contrato
                                    </button>
                                }
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Modal toggle={() => setModalOpen(!modalOpen)} isOpen={modalOpen}>
                <div className="modal-header" style={{borderBottom: 'none', paddingBottom: 0}}>
                    <h2 className="modal-title" style={{fontWeight: 800}}>{henName(hen.genetic)}</h2>
                </div>
                <ModalBody>
                    <img src={"/img/hen/" + hen.genetic + ".jpg"} alt="hen" className="img-fluid" style={{borderRadius: '12px'}}/>
                    <div className="hh-attr-row mt-3 justify-content-center">
                        <span className="hh-attr"><strong>P</strong> {hen.productivity}</span>
                        <span className="hh-attr"><strong>R</strong> {hen.endurance}</span>
                        <span className="hh-attr"><strong>F</strong> {hen.strength}</span>
                        <span className="hh-attr"><strong>E</strong> {hen.stamina}</span>
                        <span className="hh-attr"><strong>S</strong> {hen.health}</span>
                    </div>
                </ModalBody>
                <ModalFooter style={{borderTop: 'none'}}>
                    <button className="hh-btn hh-btn-primary" onClick={() => setModalOpen(!modalOpen)}>
                        Confirmar
                    </button>
                </ModalFooter>
            </Modal>
        </>
    );
};

OpenEgg.layout = Game;

export default OpenEgg;
