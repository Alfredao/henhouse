import {mdiEgg, mdiGithub, mdiMonitor} from '@mdi/js'
import {MenuAsideItem} from './interfaces'

const menuAside: MenuAsideItem[] = [
    {
        href: '/dashboard',
        icon: mdiMonitor,
        label: 'Dashboard',
    },
    {
        href: '/open-egg',
        label: 'Open egg',
        icon: mdiEgg,
    },
    // {
    //     label: 'Dropdown',
    //     icon: mdiViewList,
    //     menu: [
    //         {
    //             label: 'Item One',
    //         },
    //         {
    //             label: 'Item Two',
    //         },
    //     ],
    // },
    {
        href: 'https://github.com/Alfredao/henhouse',
        label: 'GitHub',
        icon: mdiGithub,
        target: '_blank',
    },
]

export default menuAside
