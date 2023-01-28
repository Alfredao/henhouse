import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Form, FormGroup, Input, Media, Progress, Row, Table,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import BackButton from "../../../../components/Utils/BackButton";
import {useRouter} from "next/router";
import {walletState} from "../../../../states/walletState";
import Web3 from "web3";
import houseJson from "../../../../artifacts/contracts/HenHouse.sol/HenHouse.json";
import nftJson from "../../../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import {henName} from "../../../../utils/henName";
import {FormSelect} from "react-bootstrap";

const House = (props) => {
    const router = useRouter();
    const {id} = router.query;
    const {provider, selectedAccount, blockNumber} = walletState();
    const [isApprovedForAll, setApprovedForAll] = React.useState(false);
    const [henHouse, setHenHouse] = React.useState({
        houseId: undefined,
        minLevel: 0,
        minProductivity: 0,
    });
    const [items, setItems] = React.useState([]);
    const [works, setWorks] = React.useState([]);

    const web3 = new Web3(provider);

    let house = new web3.eth.Contract(houseJson.abi, process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {
            await nft.methods.isApprovedForAll(
                selectedAccount,
                process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS
            ).call().then((r) => setApprovedForAll(r));

            await house.methods.getDetail(id).call().then(h => {
                setHenHouse({
                    houseId: h.houseId,
                    minLevel: h.minLevel,
                    minProductivity: h.minProductivity,
                })
            });

            const myHensData = await nft.methods.getHenByUser(selectedAccount).call();
            setItems(await Promise.all(myHensData.map(async i => {
                return await nft.methods.getHenDetail(i).call().then((henDetail) => {
                    return {
                        id: i,
                        level: henDetail.level,
                        productivity: henDetail.productivity,
                        endurance: henDetail.endurance,
                        strength: henDetail.strength,
                        stamina: henDetail.stamina,
                        health: henDetail.health,
                        genetic: henDetail.genetic,
                    };
                });
            })));

            const myWorksData = await house.methods.getMyWorks(id, selectedAccount).call();
            const myWorks = await Promise.all(myWorksData.map(async i => {
                const henDetail = await nft.methods.getHenDetail(i.tokenId).call().then((henDetail) => {
                    return {
                        id: i,
                        level: henDetail.level,
                        productivity: henDetail.productivity,
                        endurance: henDetail.endurance,
                        strength: henDetail.strength,
                        stamina: henDetail.stamina,
                        health: henDetail.health,
                        genetic: henDetail.genetic,
                    };
                });

                let eggsEstimative = (henDetail.productivity - henHouse.minProductivity) * henDetail.level * (blockNumber - i.blockNumber);
                if (eggsEstimative < 0) {
                    eggsEstimative = 0;
                }

                return {
                    workId: i.workId,
                    houseId: i.houseId,
                    tokenId: i.tokenId,
                    owner: i.owner,
                    blockNumber: i.blockNumber,
                    eggs: eggsEstimative,
                    henDetail: henDetail
                };
            }));

            setWorks(myWorks);
        }
    }, []);

    async function setApprovalForAll() {
        await nft.methods.setApprovalForAll(
            process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS,
            true
        ).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    }

    async function collectEggs(e) {
        await house.methods.collectEggs(e.currentTarget.getAttribute("data-work")).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    }

    async function submitForm(event) {
        event.preventDefault();

        await house.methods.startWork(
            henHouse.houseId,
            event.target.tokenId.value,
        ).send({from: selectedAccount}).then((r) => {
            console.log(r);
        });
    }

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
                                        <h3 className="mb-0">Galinheiro #{henHouse.houseId}<BackButton/></h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <h3>Level mínimo: {henHouse.minLevel}</h3>
                                <h3>Produtividade mínima: {henHouse.minProductivity}</h3>
                                <p>&nbsp;</p>
                                <Row>
                                    <Col xl={4}>
                                        <Form onSubmit={submitForm}>
                                            <FormGroup>
                                                <label htmlFor="tokenId">Selecione a galinha para trabalhar</label>
                                                <FormSelect name={"tokenId"} id="tokenId" className={"form-control"}>
                                                    {items.map((hen) =>
                                                        <option value={hen.id}>
                                                            {henName(hen.genetic)}&nbsp;
                                                            - Level {hen.level} -&nbsp;
                                                            P/{hen.productivity}&nbsp;
                                                            R/{hen.endurance}&nbsp;
                                                            F/{hen.strength}&nbsp;
                                                            E/{hen.stamina}&nbsp;
                                                            S/{hen.health}&nbsp;
                                                        </option>
                                                    )}
                                                </FormSelect>
                                            </FormGroup>
                                            {isApprovedForAll ?
                                                <Button type="submit">Iniciar trabalhos</Button> :
                                                <Button onClick={setApprovalForAll}>Aprovar</Button>}
                                        </Form>
                                    </Col>
                                </Row>
                                <Row className={"mt-5"}>
                                    <Table responsive className="align-items-center">
                                        <thead className="thead-light">
                                        <tr>
                                            <th scope="col">Galinha</th>
                                            <th scope="col">Level</th>
                                            <th scope="col">Produtividade</th>
                                            <th scope="col">Resistência</th>
                                            <th scope="col">Força</th>
                                            <th scope="col">Energia</th>
                                            <th scope="col">Saúde</th>
                                            <th scope="col">Bloco</th>
                                            <th scope="col">Ovos</th>
                                            <th scope="col">&nbsp;</th>
                                        </tr>
                                        </thead>
                                        <tbody className="list">
                                        {works.map((work) =>
                                            <tr>
                                                <td>{henName(work.henDetail.genetic)}</td>
                                                <td>{work.henDetail.level}</td>
                                                <td>{work.henDetail.productivity}</td>
                                                <td>{work.henDetail.endurance}</td>
                                                <td>{work.henDetail.strength}</td>
                                                <td>{work.henDetail.stamina}</td>
                                                <td>{work.henDetail.health}</td>
                                                <td>{work.blockNumber}</td>
                                                <td>{work.eggs}</td>
                                                <td>
                                                    <Button onClick={collectEggs} data-work={work.workId}>Coletar ovos</Button>
                                                    <Button>Sair</Button>
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

House.layout = Game;

export default House;
