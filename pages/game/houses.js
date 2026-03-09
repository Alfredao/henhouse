import React, {useEffect} from "react";
import {Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWrench} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/router";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import houseJson from "../../artifacts/contracts/HenHouse.sol/HenHouse.json";

const Houses = () => {
    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [houses, setHouses] = React.useState([]);

    const web3 = new Web3(provider);
    let house = new web3.eth.Contract(houseJson.abi, process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {
            const data = await house.methods.getAllHouses().call();
            const houses = await Promise.all(data.map(async i => ({
                houseId: i.houseId, minLevel: i.minLevel, minProductivity: i.minProductivity,
            })));
            setHouses(houses);
        }
    }, []);

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                <Card className="hh-card">
                    <CardHeader>
                        <Row className="align-items-center">
                            <Col><h3>Galinheiros</h3></Col>
                            <Col xs="auto"><span className="hh-badge hh-badge-open">{houses.length} galinheiro(s)</span></Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        {houses.length === 0 ? (
                            <div className="hh-empty-state">
                                <p>Nenhum galinheiro disponivel.</p>
                            </div>
                        ) : (
                            <Row>
                                {houses.map((h) => (
                                    <Col md={3} sm={6} key={h.houseId} className="mb-4">
                                        <div className="hh-nft-card">
                                            <img className="hh-nft-img" src={"/img/house/1.jpg"} alt={"Galinheiro #" + h.houseId}/>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="hh-nft-name">Galinheiro #{h.houseId}</span>
                                                </div>
                                                <div className="hh-stat-label mb-2">Requisitos</div>
                                                <div className="hh-attr-row">
                                                    <span className="hh-attr"><strong>Level</strong> {h.minLevel}</span>
                                                    <span className="hh-attr"><strong>Prod</strong> {h.minProductivity}</span>
                                                </div>
                                                <button className="hh-btn hh-btn-primary btn-block mt-3" onClick={() => {
                                                    router.push({pathname: '/game/houses/work/[id]', query: {id: h.houseId}});
                                                }}>
                                                    <FontAwesomeIcon icon={faWrench}/> Trabalhar
                                                </button>
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

Houses.layout = Game;

export default Houses;
