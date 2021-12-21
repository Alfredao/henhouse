import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, FormGroup, Input, Media, Progress, Row, Table,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import BackButton from "../../../../components/Utils/BackButton";
import {useRouter} from "next/router";
import {walletState} from "../../../../states/walletState";
import Web3 from "web3";
import houseJson from "../../../../artifacts/contracts/HenHouse.sol/HenHouse.json";
import nftJson from "../../../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import {henName} from "../../../../utils/henName";

const House = (props) => {
    const router = useRouter();
    const {id} = router.query;
    const {provider, selectedAccount} = walletState();
    const [henHouse, setHenHouse] = React.useState([]);
    const [items, setItems] = React.useState([]);

    const web3 = new Web3(provider);

    let house = new web3.eth.Contract(houseJson.abi, process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);

    useEffect(async () => {
        await house.methods.getDetail(id).call().then(h => {
            setHenHouse({
                houseId: h.houseId,
                minLevel: h.minLevel,
                minProductivity: h.minProductivity,
            })
        });

        const data = await nft.methods.getHenByUser(selectedAccount).call();

        const myHens = await Promise.all(data.map(async i => {
            console.log(i);
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
        }));

        setItems(myHens);
    }, [])

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
                                        <FormGroup>
                                            <label htmlFor="hen">Selecione a galinha para trabalhar</label>
                                            <Input id="hen" type="select">
                                                {items.map((hen) =>
                                                    <option>
                                                        {henName(hen.genetic)}&nbsp;
                                                        - Level {hen.level} -&nbsp;
                                                        P/{hen.productivity}&nbsp;
                                                        R/{hen.endurance}&nbsp;
                                                        F/{hen.strength}&nbsp;
                                                        E/{hen.stamina}&nbsp;
                                                        S/{hen.health}&nbsp;
                                                    </option>
                                                )}
                                            </Input>
                                        </FormGroup>
                                        <Button>Confirmar</Button>
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
                                        <tr>
                                            <td>Galinha preta</td>
                                            <td>1</td>
                                            <td>99</td>
                                            <td>80</td>
                                            <td>50</td>
                                            <td>65</td>
                                            <td>12</td>
                                            <td>125.658</td>
                                            <td>521</td>
                                            <td>
                                                <Button>Coletar ovos</Button>
                                                <Button>Sair</Button>
                                            </td>
                                        </tr>
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
