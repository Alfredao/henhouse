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
import marketJson from "../../artifacts/contracts/Marketplace.sol/Marketplace.json";
import {henName} from "../../utils/henName";

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
                const marketDetail = await market.methods.getDetail(marketItem.itemId).call().then((m) => {
                    return {
                        itemId: m.itemId,
                        nftContract: m.nftContract,
                        price: m.price,
                        seller: m.seller,
                        sold: m.sold,
                        soldTo: m.soldTo,
                        tokenId: m.tokenId
                    };
                });

                return await nft.methods.getHenDetail(marketItem.tokenId).call().then((henDetail) => {
                    return {
                        ...marketDetail,
                        hen: {
                            id: marketItem.tokenId,
                            level: henDetail.level,
                            productivity: henDetail.productivity,
                            endurance: henDetail.endurance,
                            strength: henDetail.strength,
                            stamina: henDetail.stamina,
                            health: henDetail.health,
                            genetic: henDetail.genetic,
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
                                                 src={"/img/hen/" + item.hen.genetic + ".jpg"}
                                                 data-holder-rendered="true"
                                            />
                                            <div className="card-body">
                                                <h3>{henName(item.hen.genetic)} <small className={"text-muted mt-1 float-right"}> Level {item.hen.level}</small></h3>
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
                                                                pathname: '/game/market/buy/[id]',
                                                                query: {id: item.itemId},
                                                            })
                                                        }}><FontAwesomeIcon icon={faDollarSign}/> COMPRAR</Button>
                                                        <span className={"mt-2 ml-3"}>Preço: {web3.utils.fromWei(item.price, "ether")} HEN</span>
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
