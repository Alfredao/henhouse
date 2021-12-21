import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWrench} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/router";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import houseJson from "../../artifacts/contracts/HenHouse.sol/HenHouse.json";

const Houses = (props) => {
    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [houses, setHouses] = React.useState([]);

    const web3 = new Web3(provider);

    let house = new web3.eth.Contract(houseJson.abi, process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {
            const data = await house.methods.getAllHouses().call();

            const houses = await Promise.all(data.map(async i => {
                return {
                    houseId: i.houseId,
                    minLevel: i.minLevel,
                    minProductivity: i.minProductivity,
                };
            }));

            setHouses(houses);
        }
    }, []);

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
                                        <h3 className="mb-0">Galinheiros</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    {houses.map((house) => <div className="col-md-3">
                                        <div className="card mb-4 box-shadow">
                                            <img className="card-img-top" style={{height: '200px', width: '100%', display: 'block'}}
                                                 src={"/img/house/1.jpg"}
                                                 data-holder-rendered="true"
                                            />
                                            <div className="card-body">
                                                <h3>Galinheiro #{house.houseId}</h3>
                                                <small>Requisitos</small>
                                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                                    <span className={"mr-2"}><strong>Level: </strong> {house.minLevel}</span>
                                                    <span className={"mr-2"}><strong>Produtividade: </strong> {house.minProductivity}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="btn-group">
                                                        <Button onClick={() => {
                                                            router.push({
                                                                pathname: '/game/houses/work/[id]',
                                                                query: {id: house.houseId},
                                                            })
                                                        }}><FontAwesomeIcon icon={faWrench}/> TRABALHAR</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> )}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Houses.layout = Game;

export default Houses;
