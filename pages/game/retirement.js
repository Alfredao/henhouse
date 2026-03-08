import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row, Badge} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import Web3 from "web3";
import {walletState} from "../../states/walletState";
import {useRouter} from "next/router";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import retirementJson from "../../artifacts/contracts/HenRetirement.sol/HenRetirement.json";
import {henName} from "../../utils/henName";

const Retirement = (props) => {
    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [hens, setHens] = React.useState([]);
    const [totalRetired, setTotalRetired] = React.useState(0);
    const [loading, setLoading] = React.useState({});

    const web3 = new Web3(provider);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let retirement = new web3.eth.Contract(retirementJson.abi, process.env.NEXT_PUBLIC_RETIREMENT_CONTRACT_ADDRESS);

    const loadData = async () => {
        if (!selectedAccount) return;

        const data = await nft.methods.getHenByUser(selectedAccount).call();

        const items = await Promise.all(data.map(async tokenId => {
            const henDetail = await nft.methods.getHenDetail(tokenId).call();
            const reward = await retirement.methods.calculateReward(tokenId).call();
            return {
                id: tokenId,
                level: henDetail.level,
                productivity: henDetail.productivity,
                endurance: henDetail.endurance,
                strength: henDetail.strength,
                stamina: henDetail.stamina,
                health: henDetail.health,
                genetic: henDetail.genetic,
                reward: reward,
            };
        }));

        setHens(items);

        const retired = await retirement.methods.getTotalRetired().call();
        setTotalRetired(retired);
    };

    useEffect(async () => {
        await loadData();
    }, []);

    const handleRetire = async (tokenId) => {
        setLoading({...loading, [tokenId]: true});
        try {
            // Approve the retirement contract to transfer the NFT
            await nft.methods.approve(process.env.NEXT_PUBLIC_RETIREMENT_CONTRACT_ADDRESS, tokenId)
                .send({from: selectedAccount});
            // Retire the hen
            await retirement.methods.retire(tokenId).send({from: selectedAccount});
            await loadData();
        } catch (e) {
            console.error(e);
        }
        setLoading({...loading, [tokenId]: false});
    };

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
                                        <h3 className="mb-0">Aposentadoria de Galinhas</h3>
                                        <small className="text-muted">
                                            Queime galinhas para recuperar tokens EGG.
                                            A recompensa depende do nível e atributos.
                                            Total aposentadas: {totalRetired}
                                        </small>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    {hens.map((hen, i) => (
                                        <div className="col-md-3" key={i}>
                                            <div className="card mb-4 box-shadow">
                                                <img className="card-img-top"
                                                     style={{height: '300px', width: '100%', display: 'block'}}
                                                     src={"/img/hen/" + hen.genetic + ".jpg"}
                                                     data-holder-rendered="true"
                                                />
                                                <div className="card-body">
                                                    <h3>
                                                        {henName(hen.genetic)}
                                                        <small className="text-muted mt-1 float-right">
                                                            Level {hen.level}
                                                        </small>
                                                    </h3>
                                                    <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                                        <span className="mr-2"><strong>P /</strong> {hen.productivity}</span>
                                                        <span className="mr-2"><strong>R /</strong> {hen.endurance}</span>
                                                        <span className="mr-2"><strong>F /</strong> {hen.strength}</span>
                                                        <span className="mr-2"><strong>E /</strong> {hen.stamina}</span>
                                                        <span className="mr-2"><strong>S /</strong> {hen.health}</span>
                                                    </div>
                                                    <div className="text-center mb-3">
                                                        <Badge color="success" className="p-2" style={{fontSize: '1rem'}}>
                                                            Recompensa: {web3.utils.fromWei(hen.reward, "ether")} EGG
                                                        </Badge>
                                                    </div>
                                                    <div className="text-center">
                                                        <Button
                                                            color="danger"
                                                            onClick={() => handleRetire(hen.id)}
                                                            disabled={loading[hen.id]}
                                                        >
                                                            {loading[hen.id] ? "Aposentando..." : "Aposentar Galinha"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {hens.length === 0 && (
                                        <div className="col-12 text-center p-5">
                                            <p className="text-muted">Você não tem galinhas para aposentar.</p>
                                        </div>
                                    )}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Retirement.layout = Game;

export default Retirement;
