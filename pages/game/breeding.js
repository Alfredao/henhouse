import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row, Table,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import eggJson from "../../artifacts/contracts/EggToken.sol/EggToken.json";
import breederJson from "../../artifacts/contracts/HenBreeder.sol/HenBreeder.json";
import {henName} from "../../utils/henName";
import {FormSelect} from "react-bootstrap";

const Breeding = () => {
    const {provider, selectedAccount} = walletState();
    const [hens, setHens] = React.useState([]);
    const [breedPrice, setBreedPrice] = React.useState(0);
    const [eggBalance, setEggBalance] = React.useState(0);
    const [allowance, setAllowance] = React.useState(0);
    const [breeding, setBreeding] = React.useState(false);
    const [lastChild, setLastChild] = React.useState(null);

    const web3 = new Web3(provider);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let egg = new web3.eth.Contract(eggJson.abi, process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS);
    let breeder = new web3.eth.Contract(breederJson.abi, process.env.NEXT_PUBLIC_BREEDER_CONTRACT_ADDRESS);

    async function loadData() {
        if (selectedAccount) {
            const myHens = await nft.methods.getHenByUser(selectedAccount).call();
            const henList = await Promise.all(myHens.map(async i => {
                const d = await nft.methods.getHenDetail(i).call();
                const cooldown = await breeder.methods.getCooldownRemaining(i).call();
                return {
                    id: i,
                    level: d.level,
                    productivity: d.productivity,
                    endurance: d.endurance,
                    strength: d.strength,
                    stamina: d.stamina,
                    health: d.health,
                    genetic: d.genetic,
                    cooldown: parseInt(cooldown),
                };
            }));
            setHens(henList);

            const price = await breeder.methods.getBreedPrice().call();
            setBreedPrice(price);

            const bal = await egg.methods.balanceOf(selectedAccount).call();
            setEggBalance(bal);

            const allow = await egg.methods.allowance(
                selectedAccount,
                process.env.NEXT_PUBLIC_BREEDER_CONTRACT_ADDRESS
            ).call();
            setAllowance(allow);
        }
    }

    useEffect(async () => {
        await loadData();
    }, []);

    const approveToken = async function () {
        await egg.methods.approve(
            process.env.NEXT_PUBLIC_BREEDER_CONTRACT_ADDRESS,
            web3.utils.toWei('1000000', 'ether')
        ).send({from: selectedAccount}).then(() => {
            egg.methods.allowance(
                selectedAccount,
                process.env.NEXT_PUBLIC_BREEDER_CONTRACT_ADDRESS
            ).call().then((r) => setAllowance(r));
        });
    };

    const startBreeding = async function (event) {
        event.preventDefault();
        const parent1 = event.target.parent1.value;
        const parent2 = event.target.parent2.value;

        if (parent1 === parent2) {
            alert("Selecione duas galinhas diferentes!");
            return;
        }

        setBreeding(true);
        setLastChild(null);

        await breeder.methods.breed(parent1, parent2).send({
            from: selectedAccount
        }).on('receipt', async function (receipt) {
            const breedEvent = receipt.events.HenBred;
            if (breedEvent) {
                const childId = breedEvent.returnValues.childTokenId;
                const childDetail = await nft.methods.getHenDetail(childId).call();
                setLastChild({
                    id: childId,
                    ...childDetail,
                });
            }
            await loadData();
            setBreeding(false);
        });
    };

    const needsApproval = parseInt(breedPrice.toString()) > 0 && parseInt(allowance.toString()) < parseInt(breedPrice.toString());
    const availableHens = hens.filter(h => h.cooldown === 0);

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
                                        <h3 className="mb-0">Cruzamento de galinhas</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xl={6}>
                                        <p><strong>Custo:</strong> {web3.utils.fromWei(web3.utils.toBN(breedPrice), 'ether')} EGG</p>
                                        <p><strong>Seu saldo:</strong> {web3.utils.fromWei(web3.utils.toBN(eggBalance), 'ether')} EGG</p>
                                        <p className="text-muted">Selecione dois pais para gerar uma nova galinha com atributos aleatórios. Cada galinha tem um período de descanso após o cruzamento.</p>
                                        <hr/>
                                        <form onSubmit={startBreeding}>
                                            <div className="form-group">
                                                <label htmlFor="parent1">Pai/Mãe 1</label>
                                                <FormSelect name={"parent1"} id="parent1" className={"form-control"}>
                                                    {availableHens.map((hen) =>
                                                        <option key={hen.id} value={hen.id}>
                                                            #{hen.id} {henName(hen.genetic)} - Lv{hen.level} -
                                                            P/{hen.productivity} R/{hen.endurance} F/{hen.strength} E/{hen.stamina} S/{hen.health}
                                                        </option>
                                                    )}
                                                </FormSelect>
                                            </div>
                                            <div className="form-group mt-3">
                                                <label htmlFor="parent2">Pai/Mãe 2</label>
                                                <FormSelect name={"parent2"} id="parent2" className={"form-control"}>
                                                    {availableHens.map((hen) =>
                                                        <option key={hen.id} value={hen.id}>
                                                            #{hen.id} {henName(hen.genetic)} - Lv{hen.level} -
                                                            P/{hen.productivity} R/{hen.endurance} F/{hen.strength} E/{hen.stamina} S/{hen.health}
                                                        </option>
                                                    )}
                                                </FormSelect>
                                            </div>
                                            <div className="mt-3">
                                                {needsApproval ?
                                                    <Button color="primary" size="lg" type="button" onClick={approveToken}>
                                                        Autorizar contrato
                                                    </Button> :
                                                    <Button color="success" size="lg" type="submit" disabled={breeding || availableHens.length < 2}>
                                                        {breeding ? "Cruzando..." : "Cruzar!"}
                                                    </Button>
                                                }
                                            </div>
                                        </form>

                                        {lastChild && (
                                            <div className="mt-4 p-3 bg-success rounded text-white">
                                                <h4 className="text-white">Nova galinha nasceu!</h4>
                                                <p className="mb-0">
                                                    #{lastChild.id} {henName(lastChild.genetic)} - Level {lastChild.level} -
                                                    P/{lastChild.productivity} R/{lastChild.endurance} F/{lastChild.strength} E/{lastChild.stamina} S/{lastChild.health}
                                                </p>
                                            </div>
                                        )}
                                    </Col>
                                    <Col xl={6}>
                                        <h3>Suas galinhas</h3>
                                        {hens.length === 0 ? (
                                            <p className="text-muted">Você não tem galinhas.</p>
                                        ) : (
                                            <Table responsive className="align-items-center">
                                                <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">#</th>
                                                    <th scope="col">Nome</th>
                                                    <th scope="col">Lv</th>
                                                    <th scope="col">P/R/F/E/S</th>
                                                    <th scope="col">Status</th>
                                                </tr>
                                                </thead>
                                                <tbody className="list">
                                                {hens.map((hen) =>
                                                    <tr key={hen.id}>
                                                        <td>{hen.id}</td>
                                                        <td>{henName(hen.genetic)}</td>
                                                        <td>{hen.level}</td>
                                                        <td>{hen.productivity}/{hen.endurance}/{hen.strength}/{hen.stamina}/{hen.health}</td>
                                                        <td>
                                                            {hen.cooldown > 0 ? (
                                                                <span className="badge badge-warning">Descanso ({hen.cooldown} blocos)</span>
                                                            ) : (
                                                                <span className="badge badge-success">Pronta</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                                </tbody>
                                            </Table>
                                        )}
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

Breeding.layout = Game;

export default Breeding;
