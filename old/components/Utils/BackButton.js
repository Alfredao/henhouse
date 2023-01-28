import React from "react";
import {useRouter} from "next/router";
import {Button,} from "reactstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";

function BackButton() {
    const router = useRouter();

    return (
        <React.Fragment>
            <Button className={"float-right"} onClick={() => router.back()}><FontAwesomeIcon icon={faChevronLeft}/> Voltar</Button>
        </React.Fragment>
    );
}

export default BackButton;