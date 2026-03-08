import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row, Table,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import eggJson from "../../artifacts/contracts/EggToken.sol/EggToken.json";
import arenaJson from "../../artifacts/contracts/HenArena.sol/HenArena.json";
import {henName} from "../../utils/henName";
import {FormSelect} from "react-bootstrap";

const Pve = () => {
    const {provider, selectedAccount} = walletState();
    const [items, setItems] = React.useState([]);
    const [entryFee, setEntryFee] = React.useState(0);
    const [rewardAmount, setRewardAmount] = React.useState(0);
    const [eggBalance, setEggBalance] = React.useState(0);
    const [allowance, setAllowance] = React.useState(0);
    const [battles, setBattles] = React.useState([]);
    const [fighting, setFighting] = React.useState(false);
    const [lastResult, setLastResult] = React.useState(null);

    const web3 = new Web3(provider);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let egg = new web3.eth.Contract(eggJson.abi, process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS);
    let arena = new web3.eth.Contract(arenaJson.abi, process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS);

    async function loadData() {
        if (selectedAccount) {
            const myHens = await nft.methods.getHenByUser(selectedAccount).call();
            const henList = await Promise.all(myHens.map(async i => {
                const d = await nft.methods.getHenDetail(i).call();
                return {
                    id: i,
                    level: d.level,
                    productivity: d.productivity,
                    endurance: d.endurance,
                    strength: d.strength,
                    stamina: d.stamina,
                    health: d.health,
                    genetic: d.genetic,
                };
            }));
            setItems(henList);

            const fee = await arena.methods.getEntryFee().call();
            setEntryFee(fee);

            const reward = await arena.methods.getRewardAmount().call();
            setRewardAmount(reward);

            const bal = await egg.methods.balanceOf(selectedAccount).call();
            setEggBalance(bal);

            const allow = await egg.methods.allowance(
                selectedAccount,
                process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS
            ).call();
            setAllowance(allow);

            // Load battle history (last 10)
            const battleIds = await arena.methods.getPlayerBattles(selectedAccount).call();
            const recentIds = battleIds.slice(-10).reverse();
            const battleList = await Promise.all(recentIds.map(async bId => {
                return await arena.methods.getBattle(bId).call();
            }));
            setBattles(battleList);
        }
    }

    useEffect(async () => {
        await loadData();
    }, []);

    const approveToken = async function () {
        await egg.methods.approve(
            process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS,
            web3.utils.toWei('1000000', 'ether')
        ).send({from: selectedAccount}).then(() => {
            egg.methods.allowance(
                selectedAccount,
                process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS
            ).call().then((r) => setAllowance(r));
        });
    };

    const startFight = async function (event) {
        event.preventDefault();
        const tokenId = event.target.tokenId.value;
        if (!tokenId) return;

        setFighting(true);
        setLastResult(null);

        await arena.methods.fight(tokenId).send({
            from: selectedAccount
        }).on('receipt', async function (receipt) {
            const battleEvent = receipt.events.BattleResult;
            if (battleEvent) {
                setLastResult({
                    won: battleEvent.returnValues.won,
                    reward: battleEvent.returnValues.rewardAmount,
                });
            }
            await loadData();
            setFighting(false);
        });
    };

    const needsApproval = parseInt(entryFee.toString()) > 0 && parseInt(allowance.toString()) < parseInt(entryFee.toString());

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
                                        <h3 className="mb-0">Rinha de galos (Arena PvE)</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xl={5}>
                                        <img src={"/img/fight.jpg"} alt={"rinha"} className="img-fluid mb-3" />
                                        <p><strong>Taxa de entrada:</strong> {web3.utils.fromWei(web3.utils.toBN(entryFee), 'ether')} EGG</p>
                                        <p><strong>Recompensa (vitória):</strong> {web3.utils.fromWei(web3.utils.toBN(rewardAmount), 'ether')} EGG</p>
                                        <p><strong>Seu saldo:</strong> {web3.utils.fromWei(web3.utils.toBN(eggBalance), 'ether')} EGG</p>
                                        <hr/>
                                        <form onSubmit={startFight}>
                                            <div className="form-group">
                                                <label htmlFor="tokenId">Escolha sua galinha para a luta</label>
                                                <FormSelect name={"tokenId"} id="tokenId" className={"form-control"}>
                                                    {items.map((hen) =>
                                                        <option key={hen.id} value={hen.id}>
                                                            {henName(hen.genetic)}&nbsp;
                                                            - Level {hen.level} -&nbsp;
                                                            F/{hen.strength}&nbsp;
                                                            E/{hen.stamina}&nbsp;
                                                            S/{hen.health}&nbsp;
                                                        </option>
                                                    )}
                                                </FormSelect>
                                            </div>
                                            <div className="mt-3">
                                                {needsApproval ?
                                                    <Button color="primary" size="lg" type="button" onClick={approveToken}>
                                                        Autorizar contrato
                                                    </Button> :
                                                    <Button color="danger" size="lg" type="submit" disabled={fighting || items.length === 0}>
                                                        {fighting ? "Lutando..." : "Lutar!"}
                                                    </Button>
                                                }
                                            </div>
                                        </form>
                                        {lastResult && (
                                            <div className={"mt-4 p-3 rounded " + (lastResult.won ? "bg-success text-white" : "bg-danger text-white")}>
                                                <h4 className="text-white mb-0">
                                                    {lastResult.won
                                                        ? "Vitória! +" + web3.utils.fromWei(web3.utils.toBN(lastResult.reward), 'ether') + " EGG"
                                                        : "Derrota! Tente novamente."
                                                    }
                                                </h4>
                                            </div>
                                        )}
                                    </Col>
                                    <Col xl={7}>
                                        <h3>Histórico de batalhas</h3>
                                        {battles.length === 0 ? (
                                            <p className="text-muted">Nenhuma batalha ainda. Envie sua galinha para a rinha!</p>
                                        ) : (
                                            <Table responsive className="align-items-center">
                                                <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">#</th>
                                                    <th scope="col">Galinha</th>
                                                    <th scope="col">Inimigo (F/E/S)</th>
                                                    <th scope="col">Resultado</th>
                                                </tr>
                                                </thead>
                                                <tbody className="list">
                                                {battles.map((b) =>
                                                    <tr key={b.battleId}>
                                                        <td>{b.battleId}</td>
                                                        <td>#{b.tokenId}</td>
                                                        <td>{b.enemyStrength}/{b.enemyStamina}/{b.enemyHealth}</td>
                                                        <td>
                                                            <span className={"badge badge-" + (b.won ? "success" : "danger")}>
                                                                {b.won ? "Vitória" : "Derrota"}
                                                            </span>
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

Pve.layout = Game;

export default Pve;
