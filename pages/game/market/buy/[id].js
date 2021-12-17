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

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let market = new web3.eth.Contract(marketJson.abi, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS);
    let token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);

    const buyItem = async function() {
        await market.methods.createMarketSale(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, id).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    };

    const approve = async function() {
        await token.methods.approve(process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS, web3.utils.toWei(web3.utils.toBN(2**50))).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    };

    useEffect(async () => {
        if (selectedAccount) {
            await token.methods.allowance(selectedAccount, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS).call().then((r) => {
                setAllowance(r);
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

            await market.methods.getDetail(id).call().then((a) => {
                console.log(a);
            });
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
                                        <h3 className="mb-0">Comprar galinha #{hen.id}<BackButton/></h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
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
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.productivity}%`}}/>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Resistência</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.endurance}%`}}/>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Força</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.strength}%`}}/>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Energia</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.stamina}%`}}/>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Saúde</span>
                                                <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: `${hen.health}%`}}/>
                                                </div>
                                            </li>
                                        </ul>
                                    </Col>
                                    <Col xl={4}>
                                        <h3>Preço: 10</h3>
                                        {allowance > 0 ? <Button onClick={buyItem}>Comprar</Button> :
                                        <Button onClick={approve}>Aprovar</Button> }
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
