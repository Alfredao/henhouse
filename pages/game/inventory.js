import React, {useEffect} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row, Table,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../states/walletState";
import Web3 from "web3";
import eggJson from "../../artifacts/contracts/EggToken.sol/EggToken.json";
import itemJson from "../../artifacts/contracts/HenItem.sol/HenItem.json";

const itemTypeNames = ["Ração", "Vitamina", "Armadura", "Arma"];

const Inventory = () => {
    const {provider, selectedAccount} = walletState();
    const [shopItems, setShopItems] = React.useState([]);
    const [ownedItems, setOwnedItems] = React.useState([]);
    const [eggBalance, setEggBalance] = React.useState(0);
    const [allowance, setAllowance] = React.useState(0);
    const [buying, setBuying] = React.useState(false);

    const web3 = new Web3(provider);

    let egg = new web3.eth.Contract(eggJson.abi, process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS);
    let item = new web3.eth.Contract(itemJson.abi, process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS);

    async function loadData() {
        if (selectedAccount) {
            const bal = await egg.methods.balanceOf(selectedAccount).call();
            setEggBalance(bal);

            const allow = await egg.methods.allowance(
                selectedAccount,
                process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS
            ).call();
            setAllowance(allow);

            // Load shop items
            const count = await item.methods.getItemCount().call();
            const shopList = [];
            for (let i = 1; i <= parseInt(count); i++) {
                const it = await item.methods.getItem(i).call();
                if (it.active) {
                    shopList.push(it);
                }
            }
            setShopItems(shopList);

            // Load player inventory
            const inv = await item.methods.getInventory(selectedAccount).call();
            const invDetails = await Promise.all(inv.map(async (owned) => {
                const detail = await item.methods.getItem(owned.itemId).call();
                return {
                    ...detail,
                    quantity: owned.quantity,
                };
            }));
            setOwnedItems(invDetails);
        }
    }

    useEffect(async () => {
        await loadData();
    }, []);

    const approveToken = async function () {
        await egg.methods.approve(
            process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS,
            web3.utils.toWei('1000000', 'ether')
        ).send({from: selectedAccount}).then(() => {
            egg.methods.allowance(
                selectedAccount,
                process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS
            ).call().then((r) => setAllowance(r));
        });
    };

    const buyItem = async function (itemId) {
        setBuying(true);
        await item.methods.buyItem(itemId, 1).send({
            from: selectedAccount
        }).on('receipt', async function () {
            await loadData();
            setBuying(false);
        });
    };

    const useItem = async function (itemId) {
        await item.methods.useItem(itemId, 1).send({
            from: selectedAccount
        }).on('receipt', async function () {
            await loadData();
        });
    };

    const needsApproval = parseInt(allowance.toString()) === 0;

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
                                        <h3 className="mb-0">Meus itens</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <p><strong>Seu saldo:</strong> {web3.utils.fromWei(web3.utils.toBN(eggBalance), 'ether')} EGG</p>
                                {needsApproval && (
                                    <Button color="primary" className="mb-4" onClick={approveToken}>
                                        Autorizar contrato de itens
                                    </Button>
                                )}

                                {/* Player inventory */}
                                <h3 className="mt-3">Inventário</h3>
                                {ownedItems.length === 0 ? (
                                    <p className="text-muted">Você ainda não tem itens. Compre na loja abaixo!</p>
                                ) : (
                                    <Table responsive className="align-items-center mb-5">
                                        <thead className="thead-light">
                                        <tr>
                                            <th scope="col">Item</th>
                                            <th scope="col">Tipo</th>
                                            <th scope="col">Bônus</th>
                                            <th scope="col">Quantidade</th>
                                            <th scope="col">&nbsp;</th>
                                        </tr>
                                        </thead>
                                        <tbody className="list">
                                        {ownedItems.map((it) =>
                                            <tr key={it.itemId}>
                                                <td><strong>{it.name}</strong></td>
                                                <td>{itemTypeNames[it.itemType] || "?"}</td>
                                                <td>+{it.boostValue}</td>
                                                <td>{it.quantity}</td>
                                                <td>
                                                    <Button size="sm" color="warning" onClick={() => useItem(it.itemId)}>
                                                        Usar
                                                    </Button>
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>
                                )}

                                {/* Shop */}
                                <h3 className="mt-4">Loja de itens</h3>
                                {shopItems.length === 0 ? (
                                    <p className="text-muted">Nenhum item disponível na loja.</p>
                                ) : (
                                    <Row>
                                        {shopItems.map((it) =>
                                            <Col md={3} key={it.itemId}>
                                                <Card className="mb-3">
                                                    <CardBody className="text-center">
                                                        <h4>{it.name}</h4>
                                                        <p className="text-muted mb-1">{itemTypeNames[it.itemType] || "?"}</p>
                                                        <p className="mb-1">Bônus: <strong>+{it.boostValue}</strong></p>
                                                        <p className="mb-3">Preço: <strong>{web3.utils.fromWei(web3.utils.toBN(it.price), 'ether')} EGG</strong></p>
                                                        <Button
                                                            color="primary"
                                                            disabled={buying || needsApproval}
                                                            onClick={() => buyItem(it.itemId)}
                                                        >
                                                            {buying ? "Comprando..." : "Comprar"}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        )}
                                    </Row>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Inventory.layout = Game;

export default Inventory;
