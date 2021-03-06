import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Web3 from "web3";
import {walletState} from "../../states/walletState";
import {faArrowUp, faDollarSign} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from "next/router";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import {henName} from "../../utils/henName";

const Hens = (props) => {

    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [items, setItems] = React.useState([]);

    const web3 = new Web3(provider);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {
            const data = await nft.methods.getHenByUser(selectedAccount).call();

            const items = await Promise.all(data.map(async i => {
                return await nft.methods.getHenDetail(i).call().then((henDetail) => {
                    return {
                        id: i,
                        level: henDetail.level,
                        productivity: henDetail.productivity,
                        endurance: henDetail.endurance,
                        strength: henDetail.strength,
                        stamina: henDetail.stamina,
                        health: henDetail.health,
                        genetic: henDetail.genetic,
                    };
                });
            }));

            setItems(items);
        }
    }, []);

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
                                        <h3 className="mb-0">Minhas galinhas</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    {items.map((hen, i) => <div className="col-md-3">
                                        <div className="card mb-4 box-shadow">
                                            <img className="card-img-top" style={{height: '300px', width: '100%', display: 'block'}}
                                                 src={"/img/hen/" + hen.genetic + ".jpg"}
                                                 data-holder-rendered="true"
                                            />
                                            <div className="card-body">
                                                <h3>{henName(hen.genetic)} <small className={"text-muted mt-1 float-right"}> Level {hen.level}</small></h3>
                                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                                    <span className={"mr-2"}><strong>P /</strong> {hen.productivity}</span>
                                                    <span className={"mr-2"}><strong>R /</strong> {hen.endurance}</span>
                                                    <span className={"mr-2"}><strong>F /</strong> {hen.strength}</span>
                                                    <span className={"mr-2"}><strong>E /</strong> {hen.stamina}</span>
                                                    <span className={"mr-2"}><strong>S /</strong> {hen.health}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="btn-group">
                                                        <Button onClick={() => {
                                                            router.push({
                                                                pathname: '/game/hen/train/[id]',
                                                                query: {id: hen.id},
                                                            })
                                                        }}><FontAwesomeIcon icon={faArrowUp}/> TREINAR</Button>
                                                        <Button onClick={() => {
                                                            router.push({
                                                                pathname: '/game/market/sell/[id]',
                                                                query: {id: hen.id},
                                                            })
                                                        }}><FontAwesomeIcon icon={faDollarSign}/> VENDER</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Hens.layout = Game;

export default Hens;
