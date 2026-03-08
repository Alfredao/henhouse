import React, {useEffect} from "react";
import {Card, CardBody, CardHeader, Col, Container, Row, Table,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import arenaJson from "../../artifacts/contracts/HenArena.sol/HenArena.json";

const Leaderboard = () => {
    const {provider, selectedAccount} = walletState();
    const [players, setPlayers] = React.useState([]);
    const [myStats, setMyStats] = React.useState(null);

    const web3 = new Web3(provider);
    let arena = new web3.eth.Contract(arenaJson.abi, process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS);

    async function loadData() {
        if (selectedAccount) {
            // Load leaderboard
            const lb = await arena.methods.getLeaderboard().call();
            const entries = [];
            for (let i = 0; i < lb.addresses.length; i++) {
                entries.push({
                    address: lb.addresses[i],
                    wins: parseInt(lb.wins[i]),
                    losses: parseInt(lb.losses[i]),
                    earnings: lb.earnings[i],
                });
            }

            // Sort by wins descending
            entries.sort((a, b) => b.wins - a.wins);
            setPlayers(entries);

            // Load own stats
            const stats = await arena.methods.getPlayerStats(selectedAccount).call();
            setMyStats({
                wins: parseInt(stats.wins),
                losses: parseInt(stats.losses),
                totalEarnings: stats.totalEarnings,
            });
        }
    }

    useEffect(async () => {
        await loadData();
    }, []);

    const shortAddr = (addr) => {
        if (!addr) return "";
        return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
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
                                        <h3 className="mb-0">Ranking de Lutadores</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                {myStats && (
                                    <div className="mb-4 p-3 bg-gradient-default rounded text-white">
                                        <h4 className="text-white">Suas estatísticas</h4>
                                        <Row>
                                            <Col md={3}>
                                                <strong>Vitórias:</strong> {myStats.wins}
                                            </Col>
                                            <Col md={3}>
                                                <strong>Derrotas:</strong> {myStats.losses}
                                            </Col>
                                            <Col md={3}>
                                                <strong>Taxa:</strong> {myStats.wins + myStats.losses > 0 ? Math.round(myStats.wins / (myStats.wins + myStats.losses) * 100) : 0}%
                                            </Col>
                                            <Col md={3}>
                                                <strong>Ganhos:</strong> {web3.utils.fromWei(web3.utils.toBN(myStats.totalEarnings), 'ether')} EGG
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {players.length === 0 ? (
                                    <p className="text-muted">Nenhuma batalha registrada ainda.</p>
                                ) : (
                                    <Table responsive className="align-items-center">
                                        <thead className="thead-light">
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Jogador</th>
                                            <th scope="col">Vitórias</th>
                                            <th scope="col">Derrotas</th>
                                            <th scope="col">Taxa</th>
                                            <th scope="col">Ganhos (EGG)</th>
                                        </tr>
                                        </thead>
                                        <tbody className="list">
                                        {players.map((p, idx) =>
                                            <tr key={p.address} className={p.address.toLowerCase() === selectedAccount?.toLowerCase() ? "bg-yellow text-white" : ""}>
                                                <td>
                                                    {idx === 0 && <span>&#129351;</span>}
                                                    {idx === 1 && <span>&#129352;</span>}
                                                    {idx === 2 && <span>&#129353;</span>}
                                                    {idx > 2 && (idx + 1)}
                                                </td>
                                                <td>
                                                    <strong>{shortAddr(p.address)}</strong>
                                                    {p.address.toLowerCase() === selectedAccount?.toLowerCase() && " (você)"}
                                                </td>
                                                <td>{p.wins}</td>
                                                <td>{p.losses}</td>
                                                <td>{p.wins + p.losses > 0 ? Math.round(p.wins / (p.wins + p.losses) * 100) : 0}%</td>
                                                <td>{web3.utils.fromWei(web3.utils.toBN(p.earnings), 'ether')}</td>
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

Leaderboard.layout = Game;

export default Leaderboard;
