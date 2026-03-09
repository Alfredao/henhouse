import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Web3 from "web3";
import {walletState} from "../../states/walletState";
import {faArrowUp, faDollarSign} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from "next/router";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import {henName} from "../../utils/henName";

const Hens = () => {
    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [items, setItems] = React.useState([]);

    const web3 = new Web3(provider);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {
            const data = await nft.methods.getHenByUser(selectedAccount).call();
            const items = await Promise.all(data.map(async i => {
                const d = await nft.methods.getHenDetail(i).call();
                return {
                    id: i, level: d.level, productivity: d.productivity, endurance: d.endurance,
                    strength: d.strength, stamina: d.stamina, health: d.health, genetic: d.genetic,
                };
            }));
            setItems(items);
        }
    }, []);

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                <Card className="hh-card">
                    <CardHeader>
                        <Row className="align-items-center">
                            <Col>
                                <h3>Minhas galinhas</h3>
                            </Col>
                            <Col xs="auto">
                                <span className="hh-badge hh-badge-open">{items.length} galinha(s)</span>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        {items.length === 0 ? (
                            <div className="hh-empty-state">
                                <p>Nenhuma galinha encontrada. Abra um ovo para comecar!</p>
                                <button className="hh-btn hh-btn-primary mt-3" onClick={() => router.push("/game/openEgg")}>
                                    Abrir ovo
                                </button>
                            </div>
                        ) : (
                            <Row>
                                {items.map((hen, i) => (
                                    <Col md={3} sm={6} key={hen.id} className="mb-4">
                                        <div className="hh-nft-card">
                                            <img className="hh-nft-img" src={"/img/hen/" + hen.genetic + ".jpg"} alt={henName(hen.genetic)}/>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="hh-nft-name">{henName(hen.genetic)}</span>
                                                    <span className="hh-nft-level">Lv {hen.level}</span>
                                                </div>
                                                <div className="hh-attr-row">
                                                    <span className="hh-attr"><strong>P</strong> {hen.productivity}</span>
                                                    <span className="hh-attr"><strong>R</strong> {hen.endurance}</span>
                                                    <span className="hh-attr"><strong>F</strong> {hen.strength}</span>
                                                    <span className="hh-attr"><strong>E</strong> {hen.stamina}</span>
                                                    <span className="hh-attr"><strong>S</strong> {hen.health}</span>
                                                </div>
                                                <div className="d-flex mt-3" style={{gap: '8px'}}>
                                                    <button className="hh-btn hh-btn-primary flex-fill" onClick={() => {
                                                        router.push({pathname: '/game/hen/train/[id]', query: {id: hen.id}});
                                                    }}>
                                                        <FontAwesomeIcon icon={faArrowUp}/> Treinar
                                                    </button>
                                                    <button className="hh-btn hh-btn-outline flex-fill" onClick={() => {
                                                        router.push({pathname: '/game/market/sell/[id]', query: {id: hen.id}});
                                                    }}>
                                                        <FontAwesomeIcon icon={faDollarSign}/> Vender
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

Hens.layout = Game;

export default Hens;
