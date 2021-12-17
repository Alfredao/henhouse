import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import nftJson from "../../../../artifacts/contracts/Hen.sol/Hen.json";
import marketJson from "../../../../artifacts/contracts/Marketplace.sol/Marketplace.json";
import {useRouter} from "next/router";
import {walletState} from "../../../../states/walletState";
import BackButton from "../../../../components/Utils/BackButton";

const SellHen = (props) => {
    const router = useRouter();
    const {id} = router.query;
    const {selectedAccount, web3} = walletState();
    const [hen, setHen] = React.useState({
        id: undefined,
        level: undefined,
        productivity: undefined,
        endurance: undefined,
        strength: undefined,
        stamina: undefined,
        health: undefined,
    });

    const [isApprovedForAll, setApprovedForAll] = React.useState(false);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let market = new web3.eth.Contract(marketJson.abi, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS);

    const sellItem = async function() {
        await market.methods.createMarketItem(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, id, web3.utils.toWei(web3.utils.toBN(10), 'ether')).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    };

    const approve = async function() {
        await nft.methods.setApprovalForAll(process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS, true).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    };

    useEffect(async () => {
        if (selectedAccount) {
            await nft.methods.isApprovedForAll(selectedAccount, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS).call().then((r) => setApprovedForAll(r));
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
                                        <h3 className="mb-0">Vender galinha #{hen.id}<BackButton/></h3>
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
                                        Informe o valor
                                        <input type="text" className={"form-control mb-3"} />
                                        {isApprovedForAll ?
                                        <Button onClick={sellItem}>Colocar à venda</Button> :
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
