import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Web3 from "web3";
import {walletState} from "../../states/walletState";
import {faArrowUp, faDollarSign} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from "next/router";
import nftJson from "../../artifacts/contracts/Hen.sol/Hen.json";
import marketJson from "../../artifacts/contracts/Marketplace.sol/Marketplace.json";

const Market = (props) => {

    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [items, setItems] = React.useState([]);

    const web3 = new Web3(provider);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let market = new web3.eth.Contract(marketJson.abi, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {
            const data = await market.methods.fetchMarketItems().call();

            const items = await Promise.all(data.map(async marketItem => {
                return await nft.methods.getHenDetail(marketItem.tokenId).call().then((henDetail) => {
                    return {
                        id: marketItem.itemId,
                        hen: {
                            id: marketItem.tokenId,
                            level: henDetail.level,
                            productivity: henDetail.productivity,
                            endurance: henDetail.endurance,
                            strength: henDetail.strength,
                            stamina: henDetail.stamina,
                            health: henDetail.health,
                        }
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
                                        <h3 className="mb-0">Galinhas à venda</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    {items.map((item, i) => <div className="col-md-3">
                                        <div className="card mb-4 box-shadow">
                                            <img className="card-img-top" style={{height: '300px', width: '100%', display: 'block'}}
                                                 src="/img/hen/black.jpg"
                                                 data-holder-rendered="true"
                                                 // onClick={() => {
                                                 //     router.push({
                                                 //         pathname: '/game/hen/[id]',
                                                 //         query: {id: hen.id},
                                                 //     })
                                                 // }}
                                            />
                                            <div className="card-body">
                                                <h3>GALINHA PRETA <small className={"text-muted mt-1 float-right"}> Level {item.hen.level}</small></h3>
                                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                                    <span className={"mr-2"}><strong>P /</strong> {item.hen.productivity}</span>
                                                    <span className={"mr-2"}><strong>R /</strong> {item.hen.endurance}</span>
                                                    <span className={"mr-2"}><strong>F /</strong> {item.hen.strength}</span>
                                                    <span className={"mr-2"}><strong>E /</strong> {item.hen.stamina}</span>
                                                    <span className={"mr-2"}><strong>S /</strong> {item.hen.health}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="btn-group">
                                                        <Button onClick={() => {
                                                            router.push({
                                                                pathname: '/game/hen/buy/[id]',
                                                                query: {id: item.hen.id},
                                                            })
                                                        }}><FontAwesomeIcon icon={faDollarSign}/> COMPRAR</Button>
                                                        <span className={"mt-2 ml-3"}>Preço: 10 HEN</span>
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

Market.layout = Game;

export default Market;
