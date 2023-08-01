import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
    BURN_ROUTE,
    DASHBOARD_ROUTE,
    MINTDBXENFT_ROUTE,
    FEES_ROUTE
} from "../Common/routes";

export function AppBarMobile(): any {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [location, setLocation] = useState(window.location.pathname);

    useEffect(() => setLocation(window.location.pathname), [window.location.pathname])

    return (
        <div className="navigation-mobile">
            <div className={`navigation-item ${location === BURN_ROUTE ? "active" : ""}`}
                onClick={() => navigate(BURN_ROUTE)}>
                    {t("mobile.mint")}
            </div>
            { Number(window.ethereum.networkVersion) === 1 ?
                <div className={`navigation-item dashboard ${location === DASHBOARD_ROUTE ? "active" : ""}`}
                    onClick={() => navigate(DASHBOARD_ROUTE)}>
                    <FontAwesomeIcon icon={faChartLine as IconProp} />
                </div> :
                <></>
            }
            <div className={`navigation-item ${location === FEES_ROUTE ? "active" : ""}`}
                onClick={() => navigate(FEES_ROUTE)}>
                    {t("mobile.fees")}
            </div>
            <div className={`navigation-item ${location === MINTDBXENFT_ROUTE ? "active" : ""}`}
                onClick={() => navigate(MINTDBXENFT_ROUTE)}>
                    DBXeNFT
            </div>
        </div>
    )

}