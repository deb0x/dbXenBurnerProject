import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useContext, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
    BURN_ROUTE,
    MINTDBXENFT_ROUTE,
    FEES_ROUTE,
    DBXENFT_LIST_ROUTE,
    XENON_ROUTE
} from "../Common/routes";
import xenonLogo from "../../photos/xenon_logo.svg";
import ChainContext from "../Contexts/ChainContext";

export function AppBarMobile(): any {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [location, setLocation] = useState(window.location.pathname);
    const { chain }  = useContext(ChainContext)

    useEffect(() => setLocation(window.location.pathname), [window.location.pathname])

    return (
        <div className="navigation-mobile">
            <div className={`navigation-item ${location === BURN_ROUTE ? "active" : ""}`}
                onClick={() => navigate(BURN_ROUTE)}>
                    {t("mobile.mint")}
            </div>
            {chain.chainId == "137" || 
                chain.chainId == "56" ||
                chain.chainId == "1" ? 
                <div className={`navigation-item dashboard ${location === XENON_ROUTE ? "active" : ""}`}
                    onClick={() => navigate(XENON_ROUTE)}>
                    <img src={xenonLogo} alt="xenonLogo" />
                </div> :
                <></>
            }
            
            <div className={`navigation-item ${location === FEES_ROUTE ? "active" : ""}`}
                onClick={() => navigate(FEES_ROUTE)}>
                    {t("mobile.fees")}
            </div>
            <div className={`navigation-item ${location === MINTDBXENFT_ROUTE ? "active" : ""}`}
                onClick={() => navigate(MINTDBXENFT_ROUTE)}>
                    Mint DBXeNFT
            </div>
            <div className={`navigation-item ${location === DBXENFT_LIST_ROUTE ? "active" : ""}`}
                onClick={() => navigate(DBXENFT_LIST_ROUTE)}>
                    Your DBXeNFTs
            </div>
        </div>
    )

}