import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import BackButton from "../../../../components/Utils/BackButton";
import {useRouter} from "next/router";
import {walletState} from "../../../../states/walletState";
import Web3 from "web3";
import nftJson from "../../../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import eggJson from "../../../../artifacts/contracts/EggToken.sol/EggToken.json";
import trainerJson from "../../../../artifacts/contracts/HenTrainer.sol/HenTrainer.json";
import {henName} from "../../../../utils/henName";

const Train = () => {
    const router = useRouter();
    const {id} = router.query;
    const {provider, selectedAccount} = walletState();
    const [hen, setHen] = React.useState(undefined);
    const [trainPrice, setTrainPrice] = React.useState(0);
    const [eggBalance, setEggBalance] = React.useState(0);
    const [allowance, setAllowance] = React.useState(0);
    const [training, setTraining] = React.useState(false);

    const web3 = new Web3(provider);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let egg = new web3.eth.Contract(eggJson.abi, process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS);
    let trainer = new web3.eth.Contract(trainerJson.abi, process.env.NEXT_PUBLIC_TRAINER_CONTRACT_ADDRESS);

    async function loadData() {
        if (selectedAccount && id) {
            const henDetail = await nft.methods.getHenDetail(id).call();
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

            const price = await trainer.methods.getTrainPrice().call();
            setTrainPrice(price);

            const balance = await egg.methods.balanceOf(selectedAccount).call();
            setEggBalance(balance);

            const currentAllowance = await egg.methods.allowance(
                selectedAccount,
                process.env.NEXT_PUBLIC_TRAINER_CONTRACT_ADDRESS
            ).call();
            setAllowance(currentAllowance);
        }
    }

    useEffect(async () => {
        await loadData();
    }, []);

    const approveToken = async function () {
        await egg.methods.approve(
            process.env.NEXT_PUBLIC_TRAINER_CONTRACT_ADDRESS,
            web3.utils.toWei('1000000', 'ether')
        ).send({from: selectedAccount}).then(() => {
            egg.methods.allowance(
                selectedAccount,
                process.env.NEXT_PUBLIC_TRAINER_CONTRACT_ADDRESS
            ).call().then((r) => setAllowance(r));
        });
    };

    const trainHen = async function () {
        if (parseInt(eggBalance.toString()) < parseInt(trainPrice.toString())) {
            return;
        }

        setTraining(true);

        await trainer.methods.train(id).send({
            from: selectedAccount
        }).on('receipt', async function () {
            await loadData();
            setTraining(false);
        });
    };

    if (!hen) {
        return (
            <>
                <Header/>
                <Container className="mt--7" fluid>
                    <Row className="mt-5">
                        <Col xl="12">
                            <Card className="shadow">
                                <CardBody>Carregando...</CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                <Row className="mt-5">
                    <Col className="mb-5 mb-xl-0" xl="12">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <div className="col">
                                        <h3 className="mb-0">Treinar galinha #{hen.id}<BackButton/></h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xl={4}>
                                        <img className="img-fluid mb-3" style={{maxHeight: '300px'}}
                                             src={"/img/hen/" + hen.genetic + ".jpg"}
                                             alt={henName(hen.genetic)}
                                        />
                                    </Col>
                                    <Col xl={8}>
                                        <h2>{henName(hen.genetic)}</h2>
                                        <h3>Level {hen.level}</h3>
                                        <div className="d-flex justify-content-start align-items-center mt-3 mb-3">
                                            <span className={"mr-3"}><strong>P /</strong> {hen.productivity}</span>
                                            <span className={"mr-3"}><strong>R /</strong> {hen.endurance}</span>
                                            <span className={"mr-3"}><strong>F /</strong> {hen.strength}</span>
                                            <span className={"mr-3"}><strong>E /</strong> {hen.stamina}</span>
                                            <span className={"mr-3"}><strong>S /</strong> {hen.health}</span>
                                        </div>
                                        <hr/>
                                        <p>
                                            <strong>Custo do treino:</strong> {web3.utils.fromWei(web3.utils.toBN(trainPrice), 'ether')} EGG
                                        </p>
                                        <p>
                                            <strong>Seu saldo:</strong> {web3.utils.fromWei(web3.utils.toBN(eggBalance), 'ether')} EGG
                                        </p>
                                        <p>
                                            <strong>Novo level:</strong> {parseInt(hen.level) + 1}
                                        </p>
                                        <div className="mt-4">
                                            {parseInt(allowance.toString()) >= parseInt(trainPrice.toString()) ?
                                                <Button color="primary" size="lg" onClick={trainHen} disabled={training || parseInt(eggBalance.toString()) < parseInt(trainPrice.toString())}>
                                                    {training ? "Treinando..." : parseInt(eggBalance.toString()) < parseInt(trainPrice.toString()) ? "Saldo insuficiente" : "Treinar"}
                                                </Button> :
                                                <Button color="primary" size="lg" onClick={approveToken}>
                                                    Autorizar contrato
                                                </Button>
                                            }
                                        </div>
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

Train.layout = Game;

export default Train;
