import React, {useEffect} from "react";
import {Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import nftJson from "../../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import {useRouter} from "next/router";
import {walletState} from "../../../states/walletState";
import BackButton from "../../../components/Utils/BackButton";

const Hen = () => {
    const router = useRouter();
    const {id} = router.query;
    const {selectedAccount, web3} = walletState();
    const [hen, setHen] = React.useState(undefined);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {
            await nft.methods.getHenDetail(id).call().then((henDetail) => {
                setHen({
                    id: id,
                    level: henDetail.level,
                    productivity: henDetail.productivity,
                    endurance: henDetail.endurance,
                    strength: henDetail.strength,
                    stamina: henDetail.stamina,
                    health: henDetail.health,
                });
            });
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
                                        <h3 className="mb-0">Galinha #{hen.id}<BackButton/></h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                {JSON.stringify(hen)}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Hen.layout = Game;

export default Hen;
