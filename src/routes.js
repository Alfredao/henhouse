import Hatch from "./views/Hatch.js";
import Market from "./views/Market.js";
import Inventory from "./views/Inventory";
import Chicken from "./views/Chicken";
import House from "./views/House";
import FAQ from "./views/FAQ";

const dashboardRoutes = [
    {
        path: "/hatch",
        name: "Chocar",
        icon: "fas fa-egg",
        component: Hatch,
        layout: "/game",
    },
    {
        path: "/chicken",
        name: "Minhas galinhas",
        icon: "fas fa-crow",
        component: Chicken,
        layout: "/game",
    },
    {
        path: "/house",
        name: "Galinheiro",
        icon: "fas fa-warehouse",
        component: House,
        layout: "/game",
    },
    {
        path: "/inventory",
        name: "Inventário",
        icon: "fas fa-suitcase",
        component: Inventory,
        layout: "/game",
    },
    {
        path: "/market",
        name: "Mercado",
        icon: "fas fa-hand-holding-usd",
        component: Market,
        layout: "/game",
    },
    {
        path: "/faq",
        name: "FAQ",
        icon: "fas fa-question",
        component: FAQ,
        layout: "/game",
    },
];

export default dashboardRoutes;
