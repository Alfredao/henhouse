import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row, Progress, Badge} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import Web3 from "web3";
import {walletState} from "../../states/walletState";
import dailyRewardsJson from "../../artifacts/contracts/DailyRewards.sol/DailyRewards.json";

const DailyRewards = (props) => {
    const {provider, selectedAccount} = walletState();
    const [rewardInfo, setRewardInfo] = React.useState(null);
    const [canClaim, setCanClaim] = React.useState(false);
    const [nextClaimTime, setNextClaimTime] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [claimed, setClaimed] = React.useState(false);

    const web3 = new Web3(provider);
    let dailyRewards = new web3.eth.Contract(dailyRewardsJson.abi, process.env.NEXT_PUBLIC_DAILY_REWARDS_CONTRACT_ADDRESS);

    const loadData = async () => {
        if (!selectedAccount) return;

        const reward = await dailyRewards.methods.getPlayerReward(selectedAccount).call();
        const claimable = await dailyRewards.methods.canClaim(selectedAccount).call();
        const remaining = await dailyRewards.methods.getNextClaimTime(selectedAccount).call();

        setRewardInfo(reward);
        setCanClaim(claimable);
        setNextClaimTime(Number(remaining));
    };

    useEffect(async () => {
        await loadData();
    }, []);

    const handleClaim = async () => {
        setLoading(true);
        setClaimed(false);
        try {
            await dailyRewards.methods.claimDailyReward().send({from: selectedAccount});
            setClaimed(true);
            await loadData();
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const streakDays = rewardInfo ? Number(rewardInfo.streakDays) : 0;
    const totalClaimed = rewardInfo ? web3.utils.fromWei(rewardInfo.totalClaimed, "ether") : "0";

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                <Row className="mt-5">
                    <Col className="mb-5 mb-xl-0" xl="8" className="mx-auto">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <h3 className="mb-0">Recompensa Diária</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="text-center">
                                    <h1 className="display-3 mb-4">🥚 Recompensas Diárias</h1>
                                    <p className="lead">
                                        Conecte-se todos os dias para receber ovos de graça!
                                        Mantenha sua sequência para ganhar bônus.
                                    </p>

                                    <Row className="mt-4 mb-4">
                                        <Col md="4">
                                            <Card className="bg-gradient-info text-white p-3">
                                                <h5 className="text-white">Sequência atual</h5>
                                                <h2 className="text-white">{streakDays} / 7 dias</h2>
                                                <Progress value={(streakDays / 7) * 100} className="mt-2" color="warning"/>
                                            </Card>
                                        </Col>
                                        <Col md="4">
                                            <Card className="bg-gradient-success text-white p-3">
                                                <h5 className="text-white">Total recebido</h5>
                                                <h2 className="text-white">{totalClaimed} EGG</h2>
                                            </Card>
                                        </Col>
                                        <Col md="4">
                                            <Card className="bg-gradient-warning text-white p-3">
                                                <h5 className="text-white">Próxima recompensa</h5>
                                                <h2 className="text-white">
                                                    {10 + (streakDays > 0 ? (Math.min(streakDays, 6) * 2) : 0)} EGG
                                                </h2>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <div className="mt-4 mb-4">
                                        <h4>Bônus por sequência:</h4>
                                        <div className="d-flex justify-content-center flex-wrap">
                                            {[1,2,3,4,5,6,7].map(day => (
                                                <Badge key={day}
                                                       color={day <= streakDays ? "success" : "secondary"}
                                                       className="m-2 p-3"
                                                       style={{fontSize: '1rem'}}>
                                                    Dia {day}: {10 + (day - 1) * 2} EGG
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {claimed && (
                                        <div className="alert alert-success mt-3">
                                            Recompensa coletada com sucesso!
                                        </div>
                                    )}

                                    {canClaim ? (
                                        <Button
                                            color="primary"
                                            size="lg"
                                            onClick={handleClaim}
                                            disabled={loading}
                                            className="mt-3"
                                        >
                                            {loading ? "Coletando..." : "Coletar Recompensa Diária"}
                                        </Button>
                                    ) : (
                                        <div className="mt-3">
                                            <p className="text-muted">
                                                Próxima recompensa disponível em: <strong>{formatTime(nextClaimTime)}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

DailyRewards.layout = Game;

export default DailyRewards;
