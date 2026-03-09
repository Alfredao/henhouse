import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row, Table, Input, FormGroup, Label, Badge} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import eggJson from "../../artifacts/contracts/EggToken.sol/EggToken.json";
import pvpJson from "../../artifacts/contracts/HenPvpArena.sol/HenPvpArena.json";
import itemJson from "../../artifacts/contracts/HenItem.sol/HenItem.json";
import {henName} from "../../utils/henName";
import {FormSelect} from "react-bootstrap";

const Pvp = () => {
    const {provider, selectedAccount} = walletState();
    const [hens, setHens] = React.useState([]);
    const [eggBalance, setEggBalance] = React.useState(0);
    const [allowance, setAllowance] = React.useState(0);
    const [openChallenges, setOpenChallenges] = React.useState([]);
    const [myBattles, setMyBattles] = React.useState([]);
    const [myStats, setMyStats] = React.useState(null);
    const [weapons, setWeapons] = React.useState([]);
    const [armors, setArmors] = React.useState([]);
    const [wager, setWager] = React.useState("10");
    const [creating, setCreating] = React.useState(false);
    const [accepting, setAccepting] = React.useState({});
    const [lastResult, setLastResult] = React.useState(null);
    const [minWager, setMinWager] = React.useState("5");
    const [maxWager, setMaxWager] = React.useState("1000");
    const [feePercent, setFeePercent] = React.useState(5);

    const web3 = new Web3(provider);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let egg = new web3.eth.Contract(eggJson.abi, process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS);
    let pvp = new web3.eth.Contract(pvpJson.abi, process.env.NEXT_PUBLIC_PVP_ARENA_CONTRACT_ADDRESS);
    let item = new web3.eth.Contract(itemJson.abi, process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS);

    async function loadData() {
        if (!selectedAccount) return;

        // Load hens
        const myHens = await nft.methods.getHenByUser(selectedAccount).call();
        const henList = await Promise.all(myHens.map(async id => {
            const d = await nft.methods.getHenDetail(id).call();
            return {
                id, level: d.level, productivity: d.productivity, endurance: d.endurance,
                strength: d.strength, stamina: d.stamina, health: d.health, genetic: d.genetic,
            };
        }));
        setHens(henList);

        // Load balances
        const bal = await egg.methods.balanceOf(selectedAccount).call();
        setEggBalance(bal);

        const allow = await egg.methods.allowance(selectedAccount, process.env.NEXT_PUBLIC_PVP_ARENA_CONTRACT_ADDRESS).call();
        setAllowance(allow);

        // Load arena config
        const min = await pvp.methods.getMinWager().call();
        setMinWager(web3.utils.fromWei(min, "ether"));
        const max = await pvp.methods.getMaxWager().call();
        setMaxWager(web3.utils.fromWei(max, "ether"));
        const fee = await pvp.methods.getPlatformFeePercent().call();
        setFeePercent(Number(fee));

        // Load open challenges
        const challenges = await pvp.methods.getOpenChallenges().call();
        const enriched = await Promise.all(challenges.map(async c => {
            const henDetail = await nft.methods.getHenDetail(c.challengerTokenId).call();
            return { ...c, hen: henDetail };
        }));
        setOpenChallenges(enriched);

        // Load my stats
        const stats = await pvp.methods.getPvpStats(selectedAccount).call();
        setMyStats(stats);

        // Load battle history
        const battleIds = await pvp.methods.getPlayerPvpBattles(selectedAccount).call();
        const recentIds = battleIds.slice(-10).reverse();
        const battleList = await Promise.all(recentIds.map(async bId => {
            return await pvp.methods.getPvpBattle(bId).call();
        }));
        setMyBattles(battleList);

        // Load items
        const inv = await item.methods.getInventory(selectedAccount).call();
        const weaponList = [];
        const armorList = [];
        for (let i = 0; i < inv.length; i++) {
            const detail = await item.methods.getItem(inv[i].itemId).call();
            const entry = { ...detail, quantity: inv[i].quantity };
            if (parseInt(detail.itemType) === 3) weaponList.push(entry);
            if (parseInt(detail.itemType) === 2) armorList.push(entry);
        }
        setWeapons(weaponList);
        setArmors(armorList);
    }

    useEffect(async () => {
        await loadData();
    }, []);

    const approveToken = async () => {
        await egg.methods.approve(
            process.env.NEXT_PUBLIC_PVP_ARENA_CONTRACT_ADDRESS,
            web3.utils.toWei('1000000', 'ether')
        ).send({from: selectedAccount});
        const allow = await egg.methods.allowance(selectedAccount, process.env.NEXT_PUBLIC_PVP_ARENA_CONTRACT_ADDRESS).call();
        setAllowance(allow);
    };

    const createChallenge = async (event) => {
        event.preventDefault();
        const tokenId = event.target.challengeTokenId.value;
        const weaponId = event.target.challengeWeaponId ? event.target.challengeWeaponId.value : "0";
        const armorId = event.target.challengeArmorId ? event.target.challengeArmorId.value : "0";
        if (!tokenId) return;

        setCreating(true);
        setLastResult(null);
        try {
            await pvp.methods.createChallenge(
                tokenId,
                web3.utils.toWei(wager, "ether"),
                weaponId,
                armorId
            ).send({from: selectedAccount});
            await loadData();
        } catch (e) {
            console.error(e);
        }
        setCreating(false);
    };

    const acceptChallenge = async (event) => {
        event.preventDefault();
        const challengeId = event.target.challengeId.value;
        const tokenId = event.target.acceptTokenId.value;
        const weaponId = event.target.acceptWeaponId ? event.target.acceptWeaponId.value : "0";
        const armorId = event.target.acceptArmorId ? event.target.acceptArmorId.value : "0";

        setAccepting({...accepting, [challengeId]: true});
        setLastResult(null);
        try {
            const tx = await pvp.methods.acceptChallenge(
                challengeId, tokenId, weaponId, armorId
            ).send({from: selectedAccount});

            if (tx.events && tx.events.PvpBattleResult) {
                const ev = tx.events.PvpBattleResult.returnValues;
                setLastResult({
                    won: ev.winner === selectedAccount,
                    reward: ev.reward,
                });
            }
            await loadData();
        } catch (e) {
            console.error(e);
        }
        setAccepting({...accepting, [challengeId]: false});
    };

    const cancelChallenge = async (challengeId) => {
        try {
            await pvp.methods.cancelChallenge(challengeId).send({from: selectedAccount});
            await loadData();
        } catch (e) {
            console.error(e);
        }
    };

    const needsApproval = parseInt(allowance.toString()) < parseInt(web3.utils.toWei("100", "ether"));

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                <Row className="mt-5">
                    {/* Create Challenge */}
                    <Col xl={5}>
                        <Card className="shadow mb-4">
                            <CardHeader className="border-0">
                                <h3 className="mb-0">Arena PvP - Criar Desafio</h3>
                            </CardHeader>
                            <CardBody>
                                <p><strong>Seu saldo:</strong> {web3.utils.fromWei(web3.utils.toBN(eggBalance), 'ether')} EGG</p>
                                <p><strong>Taxa da plataforma:</strong> {feePercent}%</p>
                                {myStats && (
                                    <p>
                                        <Badge color="success" className="mr-2">V: {myStats.wins}</Badge>
                                        <Badge color="danger" className="mr-2">D: {myStats.losses}</Badge>
                                        <Badge color="info">Ganhos: {web3.utils.fromWei(web3.utils.toBN(myStats.totalEarnings), 'ether')} EGG</Badge>
                                    </p>
                                )}
                                <hr/>

                                {needsApproval ? (
                                    <Button color="primary" size="lg" onClick={approveToken}>
                                        Autorizar contrato
                                    </Button>
                                ) : (
                                    <form onSubmit={createChallenge}>
                                        <FormGroup>
                                            <Label>Sua galinha</Label>
                                            <FormSelect name="challengeTokenId" className="form-control">
                                                {hens.map(hen =>
                                                    <option key={hen.id} value={hen.id}>
                                                        {henName(hen.genetic)} - Lv{hen.level} - F/{hen.strength} E/{hen.stamina} S/{hen.health}
                                                    </option>
                                                )}
                                            </FormSelect>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>Aposta (EGG) — Min: {minWager} / Max: {maxWager}</Label>
                                            <Input type="number" value={wager} onChange={e => setWager(e.target.value)}
                                                   min={minWager} max={maxWager}/>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>Arma (opcional)</Label>
                                            <FormSelect name="challengeWeaponId" className="form-control">
                                                <option value="0">Nenhuma</option>
                                                {weapons.map(w =>
                                                    <option key={w.itemId} value={w.itemId}>
                                                        {w.name} (+{w.boostValue} F) x{w.quantity}
                                                    </option>
                                                )}
                                            </FormSelect>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>Armadura (opcional)</Label>
                                            <FormSelect name="challengeArmorId" className="form-control">
                                                <option value="0">Nenhuma</option>
                                                {armors.map(a =>
                                                    <option key={a.itemId} value={a.itemId}>
                                                        {a.name} (+{a.boostValue} S) x{a.quantity}
                                                    </option>
                                                )}
                                            </FormSelect>
                                        </FormGroup>
                                        <Button color="danger" size="lg" type="submit" disabled={creating || hens.length === 0}>
                                            {creating ? "Criando..." : "Criar Desafio"}
                                        </Button>
                                    </form>
                                )}

                                {lastResult && (
                                    <div className={"mt-4 p-3 rounded " + (lastResult.won ? "bg-success text-white" : "bg-danger text-white")}>
                                        <h4 className="text-white mb-0">
                                            {lastResult.won
                                                ? "Vitória! +" + web3.utils.fromWei(web3.utils.toBN(lastResult.reward), 'ether') + " EGG"
                                                : "Derrota! Boa sorte na próxima."
                                            }
                                        </h4>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Open Challenges */}
                    <Col xl={7}>
                        <Card className="shadow mb-4">
                            <CardHeader className="border-0">
                                <h3 className="mb-0">Desafios abertos ({openChallenges.length})</h3>
                            </CardHeader>
                            <CardBody>
                                {openChallenges.length === 0 ? (
                                    <p className="text-muted">Nenhum desafio aberto. Crie o primeiro!</p>
                                ) : (
                                    openChallenges.map((c, i) => (
                                        <div key={i} className="border rounded p-3 mb-3">
                                            <Row>
                                                <Col md={6}>
                                                    <p><strong>Desafiante:</strong> {c.challenger.substring(0, 10)}...</p>
                                                    <p>
                                                        <strong>Galinha #{c.challengerTokenId}:</strong>{' '}
                                                        Lv{c.hen.level} — F/{c.hen.strength} E/{c.hen.stamina} S/{c.hen.health}
                                                    </p>
                                                    <p>
                                                        <Badge color="warning" className="p-2" style={{fontSize: '1rem'}}>
                                                            Aposta: {web3.utils.fromWei(c.wager, "ether")} EGG
                                                        </Badge>
                                                    </p>
                                                    {c.challenger === selectedAccount && (
                                                        <Button color="secondary" size="sm" onClick={() => cancelChallenge(c.challengeId)}>
                                                            Cancelar
                                                        </Button>
                                                    )}
                                                </Col>
                                                {c.challenger !== selectedAccount && (
                                                    <Col md={6}>
                                                        <form onSubmit={acceptChallenge}>
                                                            <input type="hidden" name="challengeId" value={c.challengeId}/>
                                                            <FormGroup>
                                                                <Label>Sua galinha</Label>
                                                                <FormSelect name="acceptTokenId" className="form-control">
                                                                    {hens.map(hen =>
                                                                        <option key={hen.id} value={hen.id}>
                                                                            {henName(hen.genetic)} Lv{hen.level}
                                                                        </option>
                                                                    )}
                                                                </FormSelect>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label>Arma</Label>
                                                                <FormSelect name="acceptWeaponId" className="form-control">
                                                                    <option value="0">Nenhuma</option>
                                                                    {weapons.map(w =>
                                                                        <option key={w.itemId} value={w.itemId}>
                                                                            {w.name} (+{w.boostValue}) x{w.quantity}
                                                                        </option>
                                                                    )}
                                                                </FormSelect>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label>Armadura</Label>
                                                                <FormSelect name="acceptArmorId" className="form-control">
                                                                    <option value="0">Nenhuma</option>
                                                                    {armors.map(a =>
                                                                        <option key={a.itemId} value={a.itemId}>
                                                                            {a.name} (+{a.boostValue}) x{a.quantity}
                                                                        </option>
                                                                    )}
                                                                </FormSelect>
                                                            </FormGroup>
                                                            <Button color="success" type="submit"
                                                                    disabled={accepting[c.challengeId] || hens.length === 0}>
                                                                {accepting[c.challengeId] ? "Lutando..." : "Aceitar Desafio"}
                                                            </Button>
                                                        </form>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                    ))
                                )}
                            </CardBody>
                        </Card>

                        {/* Battle History */}
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <h3 className="mb-0">Histórico de batalhas PvP</h3>
                            </CardHeader>
                            <CardBody>
                                {myBattles.length === 0 ? (
                                    <p className="text-muted">Nenhuma batalha PvP ainda.</p>
                                ) : (
                                    <Table responsive>
                                        <thead className="thead-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Jogador 1</th>
                                                <th>Jogador 2</th>
                                                <th>Vencedor</th>
                                                <th>Prêmio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myBattles.map((b, i) => (
                                                <tr key={i}>
                                                    <td>{b.battleId}</td>
                                                    <td>
                                                        {b.player1.substring(0, 8)}... (#{b.player1TokenId})
                                                    </td>
                                                    <td>
                                                        {b.player2.substring(0, 8)}... (#{b.player2TokenId})
                                                    </td>
                                                    <td>
                                                        <Badge color={b.winner === selectedAccount ? "success" : "danger"}>
                                                            {b.winner === selectedAccount ? "Você" : b.winner.substring(0, 8) + "..."}
                                                        </Badge>
                                                    </td>
                                                    <td>{web3.utils.fromWei(b.winnerReward, "ether")} EGG</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Pvp.layout = Game;

export default Pvp;
