import React, {useEffect} from "react";
import {Card, CardBody, CardHeader, Col, Container, Row, Input, Label, FormGroup, Table} from "reactstrap";
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

const Market = () => {
    const router = useRouter();
    const {provider, selectedAccount} = walletState();
    const [items, setItems] = React.useState([]);
    const [filteredItems, setFilteredItems] = React.useState([]);
    const [recentSales, setRecentSales] = React.useState([]);
    const [showHistory, setShowHistory] = React.useState(false);

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
                const m = await market.methods.getDetail(marketItem.itemId).call();
                const henDetail = await nft.methods.getHenDetail(marketItem.tokenId).call();
                return {
                    itemId: m.itemId, nftContract: m.nftContract, price: m.price,
                    seller: m.seller, sold: m.sold, soldTo: m.soldTo, tokenId: m.tokenId,
                    hen: {
                        id: marketItem.tokenId, level: henDetail.level, productivity: henDetail.productivity,
                        endurance: henDetail.endurance, strength: henDetail.strength,
                        stamina: henDetail.stamina, health: henDetail.health, genetic: henDetail.genetic,
                    }
                };
            }));
            setItems(loadedItems);
            setFilteredItems(loadedItems);

            try {
                const sales = await market.methods.getRecentSales(10).call();
                setRecentSales(sales);
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        let result = [...items];
        if (maxPrice) {
            const maxWei = web3.utils.toWei(maxPrice, "ether");
            result = result.filter(item => web3.utils.toBN(item.price).lte(web3.utils.toBN(maxWei)));
        }
        if (minLevel) result = result.filter(item => Number(item.hen.level) >= Number(minLevel));
        if (geneticFilter !== "") result = result.filter(item => String(item.hen.genetic) === geneticFilter);

        switch (sortBy) {
            case "price_asc": result.sort((a, b) => web3.utils.toBN(a.price).cmp(web3.utils.toBN(b.price))); break;
            case "price_desc": result.sort((a, b) => web3.utils.toBN(b.price).cmp(web3.utils.toBN(a.price))); break;
            case "level_asc": result.sort((a, b) => Number(a.hen.level) - Number(b.hen.level)); break;
            case "level_desc": result.sort((a, b) => Number(b.hen.level) - Number(a.hen.level)); break;
            case "productivity_desc": result.sort((a, b) => Number(b.hen.productivity) - Number(a.hen.productivity)); break;
        }
        setFilteredItems(result);
    }, [maxPrice, minLevel, geneticFilter, sortBy, items]);

    return (
        <>
            <Header/>
            <Container className="mt--7" fluid>
                {/* Filters */}
                <Card className="hh-card mb-3">
                    <CardBody>
                        <Row className="align-items-end">
                            <Col md="2">
                                <FormGroup className="mb-md-0">
                                    <Label className="hh-stat-label"><FontAwesomeIcon icon={faFilter}/> Preco max (HEN)</Label>
                                    <Input type="number" className="hh-input" placeholder="Ex: 100" value={maxPrice}
                                           onChange={(e) => setMaxPrice(e.target.value)}/>
                                </FormGroup>
                            </Col>
                            <Col md="2">
                                <FormGroup className="mb-md-0">
                                    <Label className="hh-stat-label">Nivel minimo</Label>
                                    <Input type="number" className="hh-input" placeholder="Ex: 5" value={minLevel}
                                           onChange={(e) => setMinLevel(e.target.value)}/>
                                </FormGroup>
                            </Col>
                            <Col md="2">
                                <FormGroup className="mb-md-0">
                                    <Label className="hh-stat-label">Raca</Label>
                                    <Input type="select" className="hh-input" value={geneticFilter}
                                           onChange={(e) => setGeneticFilter(e.target.value)}>
                                        <option value="">Todas</option>
                                        <option value="0">Preta</option>
                                        <option value="1">Branca</option>
                                        <option value="2">Caipira</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md="3">
                                <FormGroup className="mb-md-0">
                                    <Label className="hh-stat-label">Ordenar por</Label>
                                    <Input type="select" className="hh-input" value={sortBy}
                                           onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="price_asc">Preco: menor primeiro</option>
                                        <option value="price_desc">Preco: maior primeiro</option>
                                        <option value="level_desc">Nivel: maior primeiro</option>
                                        <option value="level_asc">Nivel: menor primeiro</option>
                                        <option value="productivity_desc">Produtividade: maior</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md="3" className="d-flex align-items-end">
                                <button className={"hh-btn mb-md-0 mb-3 " + (showHistory ? "hh-btn-primary" : "hh-btn-outline")}
                                        onClick={() => setShowHistory(!showHistory)}>
                                    <FontAwesomeIcon icon={faHistory}/> {showHistory ? "Esconder" : "Historico"}
                                </button>
                                <span className="ml-3 hh-text-muted" style={{fontSize: '0.85rem'}}>{filteredItems.length} resultado(s)</span>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* Sales History */}
                {showHistory && recentSales.length > 0 && (
                    <Card className="hh-card mb-3">
                        <CardHeader><h3>Historico de vendas recentes</h3></CardHeader>
                        <CardBody>
                            <Table responsive className="hh-table">
                                <thead>
                                    <tr>
                                        <th>Token ID</th>
                                        <th>Preco</th>
                                        <th>Vendedor</th>
                                        <th>Comprador</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSales.map((sale, i) => (
                                        <tr key={i}>
                                            <td>#{sale.tokenId}</td>
                                            <td><span className="hh-price-tag">{web3.utils.fromWei(sale.price, "ether")} HEN</span></td>
                                            <td>{sale.seller.substring(0, 8)}...</td>
                                            <td>{sale.buyer.substring(0, 8)}...</td>
                                            <td>{new Date(Number(sale.timestamp) * 1000).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                )}

                {/* Market Items */}
                <Card className="hh-card">
                    <CardHeader>
                        <h3>Galinhas a venda</h3>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            {filteredItems.map((item, i) => (
                                <Col md={3} sm={6} key={i} className="mb-4">
                                    <div className="hh-nft-card">
                                        <img className="hh-nft-img" src={"/img/hen/" + item.hen.genetic + ".jpg"} alt={henName(item.hen.genetic)}/>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="hh-nft-name">{henName(item.hen.genetic)}</span>
                                                <span className="hh-nft-level">Lv {item.hen.level}</span>
                                            </div>
                                            <div className="hh-attr-row">
                                                <span className="hh-attr"><strong>P</strong> {item.hen.productivity}</span>
                                                <span className="hh-attr"><strong>R</strong> {item.hen.endurance}</span>
                                                <span className="hh-attr"><strong>F</strong> {item.hen.strength}</span>
                                                <span className="hh-attr"><strong>E</strong> {item.hen.stamina}</span>
                                                <span className="hh-attr"><strong>S</strong> {item.hen.health}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="hh-price-tag">{web3.utils.fromWei(item.price, "ether")} HEN</span>
                                                <button className="hh-btn hh-btn-success" onClick={() => {
                                                    router.push({pathname: '/game/market/buy/[id]', query: {id: item.itemId}});
                                                }}>
                                                    <FontAwesomeIcon icon={faDollarSign}/> Comprar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                            {filteredItems.length === 0 && (
                                <Col>
                                    <div className="hh-empty-state">
                                        <p>Nenhuma galinha encontrada com os filtros selecionados.</p>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

Market.layout = Game;

export default Market;
