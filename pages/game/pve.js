import React, {useEffect} from "react";
import {Card, CardBody, CardHeader, Col, Container, Row, Table} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import eggJson from "../../artifacts/contracts/EggToken.sol/EggToken.json";
import arenaJson from "../../artifacts/contracts/HenArena.sol/HenArena.json";
import itemJson from "../../artifacts/contracts/HenItem.sol/HenItem.json";
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
    const [weapons, setWeapons] = React.useState([]);
    const [armors, setArmors] = React.useState([]);
    const [fighting, setFighting] = React.useState(false);
    const [lastResult, setLastResult] = React.useState(null);

    const web3 = new Web3(provider);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let egg = new web3.eth.Contract(eggJson.abi, process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS);
    let arena = new web3.eth.Contract(arenaJson.abi, process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS);
    let item = new web3.eth.Contract(itemJson.abi, process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS);

    async function loadData() {
        if (selectedAccount) {
            const myHens = await nft.methods.getHenByUser(selectedAccount).call();
            const henList = await Promise.all(myHens.map(async i => {
                const d = await nft.methods.getHenDetail(i).call();
                return {
                    id: i, level: d.level, productivity: d.productivity, endurance: d.endurance,
                    strength: d.strength, stamina: d.stamina, health: d.health, genetic: d.genetic,
                };
            }));
            setItems(henList);

            const fee = await arena.methods.getEntryFee().call();
            setEntryFee(fee);
            const reward = await arena.methods.getRewardAmount().call();
            setRewardAmount(reward);
            const bal = await egg.methods.balanceOf(selectedAccount).call();
            setEggBalance(bal);
            const allow = await egg.methods.allowance(selectedAccount, process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS).call();
            setAllowance(allow);

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

            const battleIds = await arena.methods.getPlayerBattles(selectedAccount).call();
            const recentIds = battleIds.slice(-10).reverse();
            const battleList = await Promise.all(recentIds.map(async bId => {
                return await arena.methods.getBattle(bId).call();
            }));
            setBattles(battleList);
        }
    }

    useEffect(async () => { await loadData(); }, []);

    const approveToken = async function () {
        await egg.methods.approve(process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS, web3.utils.toWei('1000000', 'ether'))
            .send({from: selectedAccount}).then(() => {
                egg.methods.allowance(selectedAccount, process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS).call().then((r) => setAllowance(r));
            });
    };

    const startFight = async function (event) {
        event.preventDefault();
        const tokenId = event.target.tokenId.value;
        if (!tokenId) return;
        const weaponId = event.target.weaponId ? event.target.weaponId.value : "0";
        const armorId = event.target.armorId ? event.target.armorId.value : "0";

        setFighting(true);
        setLastResult(null);

        const fightMethod = (weaponId !== "0" || armorId !== "0")
            ? arena.methods.fightWithItems(tokenId, weaponId, armorId)
            : arena.methods.fight(tokenId);

        await fightMethod.send({from: selectedAccount}).on('receipt', async function (receipt) {
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
                <Row>
                    {/* Fight Panel */}
                    <Col xl={5} className="mb-4">
                        <Card className="hh-card">
                            <CardHeader>
                                <h3>Rinha de galos (PvE)</h3>
                            </CardHeader>
                            <CardBody>
                                <img src={"/img/fight.jpg"} alt={"rinha"} className="img-fluid mb-3" style={{borderRadius: '12px'}}/>

                                <div className="d-flex justify-content-between mb-3">
                                    <div>
                                        <div className="hh-stat-label">Taxa de entrada</div>
                                        <span className="hh-price-tag">{web3.utils.fromWei(web3.utils.toBN(entryFee), 'ether')} EGG</span>
                                    </div>
                                    <div>
                                        <div className="hh-stat-label">Recompensa</div>
                                        <span className="hh-badge hh-badge-win">{web3.utils.fromWei(web3.utils.toBN(rewardAmount), 'ether')} EGG</span>
                                    </div>
                                    <div>
                                        <div className="hh-stat-label">Seu saldo</div>
                                        <span className="hh-text-muted" style={{fontWeight: 600}}>{web3.utils.fromWei(web3.utils.toBN(eggBalance), 'ether')} EGG</span>
                                    </div>
                                </div>

                                <hr/>

                                <form onSubmit={startFight}>
                                    <div className="form-group">
                                        <label className="hh-stat-label">Escolha sua galinha</label>
                                        <FormSelect name={"tokenId"} id="tokenId" className={"form-control hh-input"}>
                                            {items.map((hen) =>
                                                <option key={hen.id} value={hen.id}>
                                                    {henName(hen.genetic)} - Lv{hen.level} - F/{hen.strength} E/{hen.stamina} S/{hen.health}
                                                </option>
                                            )}
                                        </FormSelect>
                                    </div>
                                    <div className="form-group mt-3">
                                        <label className="hh-stat-label">Arma (opcional)</label>
                                        <FormSelect name={"weaponId"} id="weaponId" className={"form-control hh-input"}>
                                            <option value="0">Nenhuma</option>
                                            {weapons.map((w) =>
                                                <option key={w.itemId} value={w.itemId}>
                                                    {w.name} (+{w.boostValue} F) x{w.quantity}
                                                </option>
                                            )}
                                        </FormSelect>
                                    </div>
                                    <div className="form-group mt-2">
                                        <label className="hh-stat-label">Armadura (opcional)</label>
                                        <FormSelect name={"armorId"} id="armorId" className={"form-control hh-input"}>
                                            <option value="0">Nenhuma</option>
                                            {armors.map((a) =>
                                                <option key={a.itemId} value={a.itemId}>
                                                    {a.name} (+{a.boostValue} S) x{a.quantity}
                                                </option>
                                            )}
                                        </FormSelect>
                                    </div>
                                    <div className="mt-3">
                                        {needsApproval ?
                                            <button className="hh-btn hh-btn-primary btn-block" type="button" onClick={approveToken}>
                                                Autorizar contrato
                                            </button> :
                                            <button className="hh-btn hh-btn-danger btn-block" type="submit" disabled={fighting || items.length === 0}>
                                                {fighting ? "Lutando..." : "Lutar!"}
                                            </button>
                                        }
                                    </div>
                                </form>

                                {lastResult && (
                                    <div className={lastResult.won ? "hh-result-win" : "hh-result-loss"}>
                                        <h4 style={{color: 'white', margin: 0}}>
                                            {lastResult.won
                                                ? "Vitoria! +" + web3.utils.fromWei(web3.utils.toBN(lastResult.reward), 'ether') + " EGG"
                                                : "Derrota! Tente novamente."
                                            }
                                        </h4>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Battle History */}
                    <Col xl={7}>
                        <Card className="hh-card">
                            <CardHeader>
                                <h3>Historico de batalhas</h3>
                            </CardHeader>
                            <CardBody>
                                {battles.length === 0 ? (
                                    <div className="hh-empty-state">
                                        <p>Nenhuma batalha ainda. Envie sua galinha para a rinha!</p>
                                    </div>
                                ) : (
                                    <Table responsive className="hh-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Galinha</th>
                                                <th>Inimigo (F/E/S)</th>
                                                <th>Resultado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {battles.map((b) =>
                                                <tr key={b.battleId}>
                                                    <td>{b.battleId}</td>
                                                    <td>#{b.tokenId}</td>
                                                    <td>{b.enemyStrength}/{b.enemyStamina}/{b.enemyHealth}</td>
                                                    <td>
                                                        <span className={"hh-badge " + (b.won ? "hh-badge-win" : "hh-badge-loss")}>
                                                            {b.won ? "Vitoria" : "Derrota"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )}
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

Pve.layout = Game;

export default Pve;
