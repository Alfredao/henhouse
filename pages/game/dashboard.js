import React, {useEffect} from "react";
import {Card, CardBody, Col, Container, Row} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import eggJson from "../../artifacts/contracts/EggToken.sol/EggToken.json";
import tokenJson from "../../artifacts/contracts/HenToken.sol/HenToken.json";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrow, faEgg, faCoins, faSkullCrossbones, faWarehouse, faFistRaised} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/router";

const Dashboard = () => {
    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [henCount, setHenCount] = React.useState(0);
    const [eggBalance, setEggBalance] = React.useState("0");
    const [henBalance, setHenBalance] = React.useState("0");
    const [loaded, setLoaded] = React.useState(false);

    useEffect(async () => {
        if (selectedAccount && provider) {
            try {
                const web3 = new Web3(provider);
                const nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
                const egg = new web3.eth.Contract(eggJson.abi, process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS);
                const token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);

                const myHens = await nft.methods.getHenByUser(selectedAccount).call();
                setHenCount(myHens.length);

                const eggBal = await egg.methods.balanceOf(selectedAccount).call();
                setEggBalance(web3.utils.fromWei(eggBal, "ether"));

                const henBal = await token.methods.balanceOf(selectedAccount).call();
                setHenBalance(web3.utils.fromWei(henBal, "ether"));
            } catch (e) {
                console.error(e);
            }
            setLoaded(true);
        }
    }, []);

    const stats = [
        { label: "Galinhas", value: henCount, icon: faCrow, iconClass: "icon-primary" },
        { label: "Saldo EGG", value: parseFloat(eggBalance).toFixed(1), icon: faEgg, iconClass: "icon-success" },
        { label: "Saldo HEN", value: parseFloat(henBalance).toFixed(1), icon: faCoins, iconClass: "icon-info" },
    ];

    const features = [
        {
            title: "Abrir Ovo",
            desc: "Quebre um ovo e receba uma galinha com atributos aleatórios. Pode ser preta, branca ou caipira!",
            img: "/img/breakegg.jpg",
            href: "/game/openEgg",
            btnText: "Quebrar ovo",
        },
        {
            title: "Galinheiros",
            desc: "Coloque suas galinhas para trabalhar e colete ovos diariamente. Atenção: ovos apodrecem em 15 dias!",
            img: "/img/heninnest.jpg",
            href: "/game/houses",
            btnText: "Ver galinheiros",
        },
        {
            title: "Arena PvP",
            desc: "Desafie outros jogadores em batalhas de aposta. Aposte EGG, escolha sua galinha e lute pela vitoria!",
            img: "/img/fight2.jpg",
            href: "/game/pvp",
            btnText: "Entrar na arena",
        },
    ];

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                {/* Hero */}
                <div className="hh-hero hh-animate-in">
                    <Row className="align-items-center">
                        <Col md={7}>
                            <h1>Bem-vindo ao <span className="hh-hero-accent">Hen House</span></h1>
                            <p>
                                Explore o metaverso das galinhas! Colete, treine e batalhe com suas galinhas NFT.
                                Ganhe EGG diariamente nos galinheiros, enfrente outros jogadores na arena PvP
                                e domine o ranking.
                            </p>
                            <button className="hh-btn hh-btn-primary mt-2" onClick={() => router.push("/game/openEgg")}>
                                Comece agora
                            </button>
                        </Col>
                        <Col md={5} className="text-center d-none d-md-block">
                            <img src="/img/hens.jpg" alt="hens" style={{maxHeight: '220px', borderRadius: '12px', opacity: 0.9}} />
                        </Col>
                    </Row>
                </div>

                {/* Stats */}
                {loaded && (
                    <Row className="mb-4">
                        {stats.map((s, i) => (
                            <Col md={4} key={i} className="mb-3">
                                <Card className="hh-stat-card">
                                    <CardBody>
                                        <Row className="align-items-center">
                                            <Col xs="auto">
                                                <div className={"hh-stat-icon " + s.iconClass}>
                                                    <FontAwesomeIcon icon={s.icon}/>
                                                </div>
                                            </Col>
                                            <Col>
                                                <div className="hh-stat-label">{s.label}</div>
                                                <div className="hh-stat-value">{s.value}</div>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Features */}
                <h3 className="hh-section-title">Como jogar</h3>
                <Row className="mb-5">
                    {features.map((f, i) => (
                        <Col md={4} key={i} className="mb-4">
                            <div className="hh-feature">
                                <img src={f.img} alt={f.title} className="hh-feature-img"/>
                                <div className="hh-feature-body">
                                    <h4>{f.title}</h4>
                                    <p>{f.desc}</p>
                                    <button className="hh-btn hh-btn-primary" onClick={() => router.push(f.href)}>
                                        {f.btnText}
                                    </button>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* Quick Links */}
                <Row className="mb-5">
                    {[
                        { icon: faWarehouse, label: "Galinheiros", href: "/game/houses", color: "icon-success" },
                        { icon: faSkullCrossbones, label: "Rinhas PvE", href: "/game/pve", color: "icon-danger" },
                        { icon: faFistRaised, label: "Arena PvP", href: "/game/pvp", color: "icon-purple" },
                        { icon: faCrow, label: "Minhas Galinhas", href: "/game/hens", color: "icon-info" },
                    ].map((link, i) => (
                        <Col xs={6} md={3} key={i} className="mb-3">
                            <Card className="hh-stat-card text-center" style={{cursor: 'pointer'}} onClick={() => router.push(link.href)}>
                                <CardBody className="py-4">
                                    <div className={"hh-stat-icon mx-auto mb-3 " + link.color}>
                                        <FontAwesomeIcon icon={link.icon}/>
                                    </div>
                                    <div className="hh-stat-label">{link.label}</div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

Dashboard.layout = Game;

export default Dashboard;
