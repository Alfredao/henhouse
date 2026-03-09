import React from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row,} from "reactstrap";
import Game from "layouts/Game";
import Header from "components/Headers/Header.js";
import {walletState} from "../../states/walletState";
import Web3 from "web3";

import tokenJson from "../../artifacts/contracts/HenToken.sol/HenToken.json"
import eggJson from "../../artifacts/contracts/EggToken.sol/EggToken.json"
import summonerJson from "../../artifacts/contracts/HenSummoner.sol/HenSummoner.json"
import icoJson from "../../artifacts/contracts/HenHouseIco.sol/HenHouseIco.json"
import nftJson from "../../artifacts/contracts/HenNFT.sol/HenNFT.json"
import marketJson from "../../artifacts/contracts/Marketplace.sol/Marketplace.json"
import houseJson from "../../artifacts/contracts/HenHouse.sol/HenHouse.json"
import trainerJson from "../../artifacts/contracts/HenTrainer.sol/HenTrainer.json"
import arenaJson from "../../artifacts/contracts/HenArena.sol/HenArena.json"
import itemJson from "../../artifacts/contracts/HenItem.sol/HenItem.json"
import breederJson from "../../artifacts/contracts/HenBreeder.sol/HenBreeder.json"

const Admin = (props) => {

    const {provider, selectedAccount} = walletState();
    const web3 = new Web3(provider);

    let token = new web3.eth.Contract(tokenJson.abi, process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS);
    let egg = new web3.eth.Contract(eggJson.abi, process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS);
    let summoner = new web3.eth.Contract(summonerJson.abi, process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS);
    let market = new web3.eth.Contract(marketJson.abi, process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS);
    let ico = new web3.eth.Contract(icoJson.abi, process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS);
    let nft = new web3.eth.Contract(nftJson.abi, process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    let house = new web3.eth.Contract(houseJson.abi, process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS);
    let trainer = new web3.eth.Contract(trainerJson.abi, process.env.NEXT_PUBLIC_TRAINER_CONTRACT_ADDRESS);
    let arena = new web3.eth.Contract(arenaJson.abi, process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS);
    let itemContract = new web3.eth.Contract(itemJson.abi, process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS);
    let breederContract = new web3.eth.Contract(breederJson.abi, process.env.NEXT_PUBLIC_BREEDER_CONTRACT_ADDRESS);

    const setHenToken = async function () {
        await ico.methods.setHenToken(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleMintIco = async function () {
        await token.methods.grantRole(web3.utils.keccak256('MINTER_ROLE'), process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const sendBNB = async function () {
        web3.eth.sendTransaction({
            from: selectedAccount,
            to: process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS,
            value: web3.utils.toWei("0.1", "ether")
        });
    };

    const setSummonToken = async function () {
        await summoner.methods.setHenToken(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setSummonPrice = async function () {
        await summoner.methods.setSummonPrice(web3.utils.toWei('1', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setHen = async function () {
        await summoner.methods.setHen(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleMintNft = async function () {
        await nft.methods.grantRole(web3.utils.keccak256('MINTER_ROLE'), process.env.NEXT_PUBLIC_SUMMONER_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setMarketToken = async function () {
        await market.methods.setHenToken(process.env.NEXT_PUBLIC_HEN_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const createHenHouse = async function () {
        await house.methods.createHouse(1, 50).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await house.methods.createHouse(2, 61).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await house.methods.createHouse(3, 61).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await house.methods.createHouse(4, 61).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setHouseHen = async function () {
        await house.methods.setHen(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setEggToken = async function () {
        await house.methods.setEggToken(process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setTrainerHen = async function () {
        await trainer.methods.setHen(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setTrainerEggToken = async function () {
        await trainer.methods.setEggToken(process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setTrainPrice = async function () {
        await trainer.methods.setTrainPrice(web3.utils.toWei('10', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleMintNftTrainer = async function () {
        await nft.methods.grantRole(web3.utils.keccak256('MINTER_ROLE'), process.env.NEXT_PUBLIC_TRAINER_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    // Arena setup
    const setArenaHen = async function () {
        await arena.methods.setHen(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setArenaEggToken = async function () {
        await arena.methods.setEggToken(process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setArenaEntryFee = async function () {
        await arena.methods.setEntryFee(web3.utils.toWei('5', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setArenaReward = async function () {
        await arena.methods.setRewardAmount(web3.utils.toWei('15', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleMintEggArena = async function () {
        await egg.methods.grantRole(web3.utils.keccak256('MINTER_ROLE'), process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    // Item shop setup
    const setItemEggToken = async function () {
        await itemContract.methods.setEggToken(process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const createShopItems = async function () {
        await itemContract.methods.createItem("Ração Premium", 0, 10, web3.utils.toWei('5', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await itemContract.methods.createItem("Vitamina A", 1, 15, web3.utils.toWei('8', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await itemContract.methods.createItem("Armadura de Ferro", 2, 20, web3.utils.toWei('20', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));

        await itemContract.methods.createItem("Espora Afiada", 3, 25, web3.utils.toWei('30', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setArenaHenItem = async function () {
        await arena.methods.setHenItem(process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setItemOperatorArena = async function () {
        await itemContract.methods.setOperator(process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS, true).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setHouseHenItem = async function () {
        await house.methods.setHenItem(process.env.NEXT_PUBLIC_ITEM_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setItemOperatorHouse = async function () {
        await itemContract.methods.setOperator(process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS, true).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    // Breeder setup
    const setBreederHen = async function () {
        await breederContract.methods.setHen(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setBreederEggToken = async function () {
        await breederContract.methods.setEggToken(process.env.NEXT_PUBLIC_EGG_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const setBreedPrice = async function () {
        await breederContract.methods.setBreedPrice(web3.utils.toWei('20', 'ether')).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleMintNftBreeder = async function () {
        await nft.methods.grantRole(web3.utils.keccak256('MINTER_ROLE'), process.env.NEXT_PUBLIC_BREEDER_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

    const grantRoleMintEggWorker = async function () {
        await egg.methods.grantRole(web3.utils.keccak256('MINTER_ROLE'), process.env.NEXT_PUBLIC_HOUSE_CONTRACT_ADDRESS).send({
            from: selectedAccount
        }).then((r) => console.log(r));
    };

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
                                        <h3 className="mb-0">Admin</h3>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <div className="container d-flex h-100">
                                    <Row className="align-self-center w-100">
                                        <div className="col-6 mx-auto">
                                            <div className="jumbotron">
                                                {/*<Button className="btn-lg btn-block" onClick={addWhitelistAddress}>Entrar na whitelist</Button>*/}
                                                <Button className="btn-lg btn-block" onClick={sendBNB}>Enviar 0.1 BNB</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setHenToken}>Definir moeda do ICO</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleMintIco}>Garantir permissão de gerar tokens pelo ICO</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setSummonToken}>Definir moeda de summon</Button>
                                                <Button className="btn-lg btn-block" onClick={setSummonPrice}>Definir preço do summon</Button>
                                                <Button className="btn-lg btn-block" onClick={setHen}>Definir item para summon</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleMintNft}>Garantir permissão de summon</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setMarketToken}>Definir moeda do market</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={createHenHouse}>Criar galinheiro</Button>
                                                <Button className="btn-lg btn-block" onClick={setHouseHen}>Definir galinhas do galinheiro</Button>
                                                <Button className="btn-lg btn-block" onClick={setEggToken}>Definir moeda de recomensa (ovos)</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleMintEggWorker}>Garantir permissão de coletar ovos</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setTrainerHen}>Definir galinhas do treinador</Button>
                                                <Button className="btn-lg btn-block" onClick={setTrainerEggToken}>Definir moeda do treinador (ovos)</Button>
                                                <Button className="btn-lg btn-block" onClick={setTrainPrice}>Definir preço do treino</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleMintNftTrainer}>Garantir permissão de treinar (levelUp)</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setArenaHen}>Definir galinhas da arena</Button>
                                                <Button className="btn-lg btn-block" onClick={setArenaEggToken}>Definir moeda da arena (ovos)</Button>
                                                <Button className="btn-lg btn-block" onClick={setArenaEntryFee}>Definir taxa de entrada da arena</Button>
                                                <Button className="btn-lg btn-block" onClick={setArenaReward}>Definir recompensa da arena</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleMintEggArena}>Garantir permissão de recompensa da arena</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setItemEggToken}>Definir moeda da loja de itens (ovos)</Button>
                                                <Button className="btn-lg btn-block" onClick={createShopItems}>Criar itens na loja</Button>
                                                <Button className="btn-lg btn-block" onClick={setArenaHenItem}>Definir itens da arena</Button>
                                                <Button className="btn-lg btn-block" onClick={setItemOperatorArena}>Autorizar arena como operador de itens</Button>
                                                <Button className="btn-lg btn-block" onClick={setHouseHenItem}>Definir itens do galinheiro</Button>
                                                <Button className="btn-lg btn-block" onClick={setItemOperatorHouse}>Autorizar galinheiro como operador de itens</Button>
                                                <hr/>
                                                <Button className="btn-lg btn-block" onClick={setBreederHen}>Definir galinhas do cruzamento</Button>
                                                <Button className="btn-lg btn-block" onClick={setBreederEggToken}>Definir moeda do cruzamento (ovos)</Button>
                                                <Button className="btn-lg btn-block" onClick={setBreedPrice}>Definir preço do cruzamento</Button>
                                                <Button className="btn-lg btn-block" onClick={grantRoleMintNftBreeder}>Garantir permissão de cruzamento (mint)</Button>
                                            </div>
                                        </div>
                                    </Row>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

Admin.layout = Game;

export default Admin;