import {faEgg, faCrow, faTv, faWarehouse, faSkullCrossbones, faSuitcase, faHandHoldingUsd, faQuestion, faTrophy, faHeart, faGift, faBed} from '@fortawesome/free-solid-svg-icons'

const routes = [
    {
        path: "/dashboard",
        name: "Home",
        icon: faTv,
        layout: "/game",
    },
    {
        path: "/openEgg",
        name: "Abrir ovo",
        icon: faEgg,
        layout: "/game",
    },
    {
        path: "/hens",
        name: "Minhas galinhas",
        icon: faCrow,
        layout: "/game",
    },
    {
        path: "/houses",
        name: "Galinheiros",
        icon: faWarehouse,
        layout: "/game",
    },
    {
        path: "/pve",
        name: "Rinhas",
        icon: faSkullCrossbones,
        layout: "/game",
    },
    {
        path: "/inventory",
        name: "Inventário",
        icon: faSuitcase,
        layout: "/game",
    },
    {
        path: "/leaderboard",
        name: "Ranking",
        icon: faTrophy,
        layout: "/game",
    },
    {
        path: "/breeding",
        name: "Cruzamento",
        icon: faHeart,
        layout: "/game",
    },
    {
        path: "/dailyRewards",
        name: "Recompensa Diária",
        icon: faGift,
        layout: "/game",
    },
    {
        path: "/retirement",
        name: "Aposentadoria",
        icon: faBed,
        layout: "/game",
    },
    {
        path: "/market",
        name: "Mercado",
        icon: faHandHoldingUsd,
        layout: "/game",
    },
    {
        path: "/faq",
        name: "FAQ",
        icon: faQuestion,
        layout: "/game",
    },
    {
        path: "/admin",
        name: "Admin",
        icon: faQuestion,
        layout: "/game",
    },
];

export default routes;
