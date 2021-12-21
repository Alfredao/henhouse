import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Form, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import nftJson from "../../../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import marketJson from "../../../../artifacts/contracts/Marketplace.sol/Marketplace.json";
import {useRouter} from "next/router";
import {walletState} from "../../../../states/walletState";
import BackButton from "../../../../components/Utils/BackButton";
import {ProgressBar} from "react-bootstrap";

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

    const setApprovalForAll = async function () {
        await nft.methods.setApprovalForAll(
            process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS,
            true
        ).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    };

    const submitForm = async (event) => {
        event.preventDefault();

        await market.methods.createMarketItem(
            process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
            id,
            web3.utils.toWei(web3.utils.toBN(event.target.price.value), 'ether')
        ).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    };

    useEffect(async () => {
        if (selectedAccount) {
            await nft.methods.isApprovedForAll(
                selectedAccount,
                process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS
            ).call().then((r) => setApprovedForAll(r));

            await nft.methods.getHenDetail(id).call().then((henDetail) => {
                setHen({
                    id: id,
                    level: henDetail.level,
                    productivity: henDetail.productivity,
                    endurance: henDetail.endurance,
                    strength: henDetail.strength,
                    stamina: henDetail.stamina,
                    health: henDetail.health,
                    genetic: henDetail.genetic,
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
                                            <img className="card-img-top img-fluid" src={"/img/hen/" + hen.genetic + ".jpg"} alt="Hen"/>
                                        </div>
                                    </Col>
                                    <Col xl={4}>
                                        <ul className="list-group">
                                            <li className="list-group-item">
                                                <span className="attrName">Produtividade</span>
                                                <span className="attrName float-right">{hen.productivity}</span>
                                                <ProgressBar now={hen.productivity} />
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Resistência</span>
                                                <span className="attrName float-right">{hen.endurance}</span>
                                                <ProgressBar now={hen.endurance} />
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Força</span>
                                                <span className="attrName float-right">{hen.strength}</span>
                                                <ProgressBar now={hen.strength} />
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Energia</span>
                                                <span className="attrName float-right">{hen.stamina}</span>
                                                <ProgressBar now={hen.stamina} />
                                            </li>
                                            <li className="list-group-item">
                                                <span className="attrName">Saúde</span>
                                                <span className="attrName float-right">{hen.health}</span>
                                                <ProgressBar now={hen.health} />
                                            </li>
                                        </ul>
                                    </Col>
                                    <Col xl={4}>
                                        <Form onSubmit={submitForm}>
                                            Informe o valor
                                            <input type="text" name={"price"} className={"form-control mb-3"}/>
                                            {isApprovedForAll ?
                                                <Button type="submit">Colocar à venda</Button> :
                                                <Button onClick={setApprovalForAll}>Aprovar</Button>}
                                        </Form>
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
