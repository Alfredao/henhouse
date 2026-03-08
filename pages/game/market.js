import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row, Input, Label, FormGroup, Table} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Web3 from "web3";
import {walletState} from "../../states/walletState";
import {faDollarSign, faFilter, faHistory} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from "next/router";
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json";
import marketJson from "../../artifacts/contracts/Marketplace.sol/Marketplace.json";
import {henName} from "../../utils/henName";

const Market = (props) => {

    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [items, setItems] = React.useState([]);
    const [filteredItems, setFilteredItems] = React.useState([]);
    const [recentSales, setRecentSales] = React.useState([]);
    const [showHistory, setShowHistory] = React.useState(false);

    // Filters
    const [maxPrice, setMaxPrice] = React.useState("");
    const [minLevel, setMinLevel] = React.useState("");
    const [geneticFilter, setGeneticFilter] = React.useState("");
    const [sortBy, setSortBy] = React.useState("price_asc");

    const web3 = new Web3(provider);

    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let market = new web3.eth.Contract(marketJson.abi, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS);

    useEffect(async () => {
        if (selectedAccount) {
            const data = await market.methods.fetchMarketItems().call();
            const loadedItems = await Promise.all(data.map(async marketItem => {
                const marketDetail = await market.methods.getDetail(marketItem.itemId).call().then((m) => {
                    return {
                        itemId: m.itemId,
                        nftContract: m.nftContract,
                        price: m.price,
                        seller: m.seller,
                        sold: m.sold,
                        soldTo: m.soldTo,
                        tokenId: m.tokenId
                    };
                });

                return await nft.methods.getHenDetail(marketItem.tokenId).call().then((henDetail) => {
                    return {
                        ...marketDetail,
                        hen: {
                            id: marketItem.tokenId,
                            level: henDetail.level,
                            productivity: henDetail.productivity,
                            endurance: henDetail.endurance,
                            strength: henDetail.strength,
                            stamina: henDetail.stamina,
                            health: henDetail.health,
                            genetic: henDetail.genetic,
                        }
                    };
                });
            }));

            setItems(loadedItems);
            setFilteredItems(loadedItems);

            // Load recent sales
            try {
                const sales = await market.methods.getRecentSales(10).call();
                setRecentSales(sales);
            } catch (e) {
                // getRecentSales may not be available on older deployments
            }
        }
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let result = [...items];

        if (maxPrice) {
            const maxWei = web3.utils.toWei(maxPrice, "ether");
            result = result.filter(item =>
                web3.utils.toBN(item.price).lte(web3.utils.toBN(maxWei))
            );
        }

        if (minLevel) {
            result = result.filter(item => Number(item.hen.level) >= Number(minLevel));
        }

        if (geneticFilter !== "") {
            result = result.filter(item => String(item.hen.genetic) === geneticFilter);
        }

        switch (sortBy) {
            case "price_asc":
                result.sort((a, b) => web3.utils.toBN(a.price).cmp(web3.utils.toBN(b.price)));
                break;
            case "price_desc":
                result.sort((a, b) => web3.utils.toBN(b.price).cmp(web3.utils.toBN(a.price)));
                break;
            case "level_asc":
                result.sort((a, b) => Number(a.hen.level) - Number(b.hen.level));
                break;
            case "level_desc":
                result.sort((a, b) => Number(b.hen.level) - Number(a.hen.level));
                break;
            case "productivity_desc":
                result.sort((a, b) => Number(b.hen.productivity) - Number(a.hen.productivity));
                break;
        }

        setFilteredItems(result);
    }, [maxPrice, minLevel, geneticFilter, sortBy, items]);

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                {/* Filters */}
                <Row className="mt-5">
                    <Col xl="12">
                        <Card className="shadow mb-3">
                            <CardBody>
                                <Row className="align-items-end">
                                    <Col md="2">
                                        <FormGroup>
                                            <Label><FontAwesomeIcon icon={faFilter}/> Preço máx (HEN)</Label>
                                            <Input type="number" placeholder="Ex: 100" value={maxPrice}
                                                   onChange={(e) => setMaxPrice(e.target.value)}/>
                                        </FormGroup>
                                    </Col>
                                    <Col md="2">
                                        <FormGroup>
                                            <Label>Nível mínimo</Label>
                                            <Input type="number" placeholder="Ex: 5" value={minLevel}
                                                   onChange={(e) => setMinLevel(e.target.value)}/>
                                        </FormGroup>
                                    </Col>
                                    <Col md="2">
                                        <FormGroup>
                                            <Label>Raça</Label>
                                            <Input type="select" value={geneticFilter}
                                                   onChange={(e) => setGeneticFilter(e.target.value)}>
                                                <option value="">Todas</option>
                                                <option value="0">Preta</option>
                                                <option value="1">Branca</option>
                                                <option value="2">Caipira</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label>Ordenar por</Label>
                                            <Input type="select" value={sortBy}
                                                   onChange={(e) => setSortBy(e.target.value)}>
                                                <option value="price_asc">Preço: menor primeiro</option>
                                                <option value="price_desc">Preço: maior primeiro</option>
                                                <option value="level_desc">Nível: maior primeiro</option>
                                                <option value="level_asc">Nível: menor primeiro</option>
                                                <option value="productivity_desc">Produtividade: maior</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Button color={showHistory ? "primary" : "secondary"}
                                                    onClick={() => setShowHistory(!showHistory)} className="mb-3">
                                                <FontAwesomeIcon icon={faHistory}/> {showHistory ? "Esconder" : "Ver"} Histórico
                                            </Button>
                                            <span className="ml-2 text-muted">{filteredItems.length} resultado(s)</span>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Price History */}
                {showHistory && recentSales.length > 0 && (
                    <Row>
                        <Col xl="12">
                            <Card className="shadow mb-3">
                                <CardHeader className="border-0">
                                    <h3 className="mb-0">Histórico de vendas recentes</h3>
                                </CardHeader>
                                <CardBody>
                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th>Token ID</th>
                                                <th>Preço</th>
                                                <th>Vendedor</th>
                                                <th>Comprador</th>
                                                <th>Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSales.map((sale, i) => (
                                                <tr key={i}>
                                                    <td>#{sale.tokenId}</td>
                                                    <td>{web3.utils.fromWei(sale.price, "ether")} HEN</td>
                                                    <td>{sale.seller.substring(0, 8)}...</td>
                                                    <td>{sale.buyer.substring(0, 8)}...</td>
                                                    <td>{new Date(Number(sale.timestamp) * 1000).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Market Items */}
                <Row>
                    <Col className="mb-5 mb-xl-0" xl="12">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <div className="col">
                                        <h3 className="mb-0">Galinhas à venda</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    {filteredItems.map((item, i) => <div className="col-md-3" key={i}>
                                        <div className="card mb-4 box-shadow">
                                            <img className="card-img-top" style={{height: '300px', width: '100%', display: 'block'}}
                                                 src={"/img/hen/" + item.hen.genetic + ".jpg"}
                                                 data-holder-rendered="true"
                                            />
                                            <div className="card-body">
                                                <h3>{henName(item.hen.genetic)} <small className={"text-muted mt-1 float-right"}> Level {item.hen.level}</small></h3>
                                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                                    <span className={"mr-2"}><strong>P /</strong> {item.hen.productivity}</span>
                                                    <span className={"mr-2"}><strong>R /</strong> {item.hen.endurance}</span>
                                                    <span className={"mr-2"}><strong>F /</strong> {item.hen.strength}</span>
                                                    <span className={"mr-2"}><strong>E /</strong> {item.hen.stamina}</span>
                                                    <span className={"mr-2"}><strong>S /</strong> {item.hen.health}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="btn-group">
                                                        <Button onClick={() => {
                                                            router.push({
                                                                pathname: '/game/market/buy/[id]',
                                                                query: {id: item.itemId},
                                                            })
                                                        }}><FontAwesomeIcon icon={faDollarSign}/> COMPRAR</Button>
                                                        <span className={"mt-2 ml-3"}>Preço: {web3.utils.fromWei(item.price, "ether")} HEN</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)}
                                    {filteredItems.length === 0 && (
                                        <div className="col-12 text-center p-5">
                                            <p className="text-muted">Nenhuma galinha encontrada com os filtros selecionados.</p>
                                        </div>
                                    )}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Market.layout = Game;

export default Market;
