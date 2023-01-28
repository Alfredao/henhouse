import {mdiOpenInNew, mdiTableBorder} from '@mdi/js'
import Head from 'next/head'
import React, {ReactElement} from 'react'
import CardBox from '../../components/CardBox'
import LayoutAuthenticated from '../../layouts/Authenticated'
import SectionMain from '../../components/SectionMain'
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton'
import {getPageTitle} from '../../config'
import BaseButtons from "../../components/BaseButtons";
import BaseButton from "../../components/BaseButton";

const OpenEggPage = () => {
    return (
        <>
            <Head>
                <title>{getPageTitle('Open Egg')}</title>
            </Head>
            <SectionMain>
                <SectionTitleLineWithButton icon={mdiTableBorder} title="Open Egg" main>
                </SectionTitleLineWithButton>

                <CardBox className="mx-auto">
                    <img src="/game/images/open-egg.png" alt="open-egg" width={"50%"}/>
                    <BaseButtons type="" noWrap>
                        <BaseButton
                            color="success"
                            label="Open egg"
                            icon={mdiOpenInNew}
                        />
                    </BaseButtons>
                </CardBox>
            </SectionMain>
        </>
    )
}

OpenEggPage.getLayout = function getLayout(page: ReactElement) {
    return <LayoutAuthenticated>{page}</LayoutAuthenticated>
}

export default OpenEggPage
