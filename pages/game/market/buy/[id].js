import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import nftJson from "../../../../artifacts/contracts/Hen.sol/Hen.json";
import marketJson from "../../../../artifacts/contracts/Marketplace.sol/Marketplace.json";
import {useRouter} from "next/router";
import {walletState} from "../../../../states/walletState";
import BackButton from "../../../../components/Utils/BackButton";
import tokenJson from "../../../../artifacts/contracts/HenHouse.sol/HenHouse.json";
import {faCheck, faDollarSign} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const SellHen = (props) => {
    const router = useRouter();
    const {id} = router.query;
    const {selectedAccount, web3} = walletState();
    const [allowance, setAllowance] = React.useState(0);
    const [hen, setHen] = React.useState({
        id: undefined,
        level: undefined,
        productivity: undefined,
        endurance: undefined,
        strength: undefined,
        stamina: undefined,
        health: undefined,
    });

    const [marketItem, setMarketItem] = React.useState({
        itemId: undefined,
        nftContract: undefined,
        price: 0,
        seller: undefined,
        sold: false,
        soldTo: undefined,
        tokenId: undefined
    });

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let market = new web3.eth.Contract(marketJson.abi, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS);
    let token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {

            await getAllowance();

            await market.methods.getDetail(id).call().then((marketItem) => {
                setMarketItem({
                    itemId: marketItem.itemId,
                    nftContract: marketItem.nftContract,
                    price: marketItem.price,
                    seller: marketItem.seller,
                    sold: marketItem.sold,
                    soldTo: marketItem.soldTo,
                    tokenId: marketItem.tokenId
                });
            });

            await nft.methods.getHenDetail(id).call().then((henDetail) => {
                setHen({
                    id: id,
                    level: henDetail.level,
                    productivity: henDetail.productivity,
                    endurance: henDetail.endurance,
                    strength: henDetail.strength,
                    stamina: henDetail.stamina,
                    health: henDetail.health,
                });
            });
        }
    }, []);

    async function getAllowance() {
        await token.methods.allowance(selectedAccount, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS).call().then((r) => {
            setAllowance(r);
        });
    }

    async function approveToken() {
        await token.methods.approve(
            process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS,
            web3.utils.toWei("100000", "ether")
        ).send({from: selectedAccount}).on('receipt', async function (receipt) {
            await getAllowance();
        });
    }

    async function buyItem() {
        await market.methods.createMarketSale(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, id).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    }

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
                                        <h3 className="mb-0">Comprar galinha #{hen.id}<BackButton/></h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col className={"mb-5"} xl={12}>{JSON.stringify(marketItem)}</Col>
                                </Row>
                                <Row>
                                    <Col xl={4}>
                                        <div className="card">
                                            <img className="card-img-top img-fluid" src="/img/hen/black.jpg" alt="Hen"/>
                                        </div>
                                    </Col>
                                    <Col xl={4}>
                                        <ul className="list-group">
                                            <li className="list-group-item">
                                                <span className="attrName">Produtividade</span>
                                                <span className="attrName float-right">{hen.productivity}</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.productivity}%`}}/>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Resistência</span>
                                                <span className="attrName float-right">{hen.endurance}</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.endurance}%`}}/>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Força</span>
                                                <span className="attrName float-right">{hen.strength}</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.strength}%`}}/>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Energia</span>
                                                <span className="attrName float-right">{hen.stamina}</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.stamina}%`}}/>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Saúde</span>
                                                <span className="attrName float-right">{hen.health}</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.health}%`}}/>
                                                </div>
                                            </li>
                                        </ul>
                                    </Col>
                                    <Col xl={4}>
                                        <h2>Preço: {web3.utils.fromWei(web3.utils.toBN(marketItem.price), "ether")} HEN</h2>
                                        {marketItem.seller === selectedAccount ? "" :
                                        <>
                                            {parseInt(allowance.toString()) > parseInt(marketItem.price) ?
                                            <Button onClick={buyItem}><FontAwesomeIcon icon={faDollarSign}/> Comprar</Button> :
                                            <Button onClick={approveToken}><FontAwesomeIcon icon={faCheck}/> Autorizar contrato</Button>}
                                        </>}
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

SellHen.layout = Game;

export default SellHen;
