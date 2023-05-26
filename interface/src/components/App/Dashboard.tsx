import { useState, useEffect } from "react";
import "../../componentsStyling/dashboard.scss";

export function Dashboard(props: any): any {

    const [language, setLanguage] = useState("en");

    useEffect(() => {
        if(JSON.parse(localStorage.getItem('language') || "null") !== null)
            setLanguage(JSON.parse(localStorage.getItem('language') || "null"));
    }, [language])

    useEffect(() => {
        localStorage.setItem('language', JSON.stringify(language));
    }, [language]);

    return (
        <div id="dbxen-iframe">
            <iframe
                src={`https://xenturbo.io/dashboard/dbxen?locale=EN&totalBurned=${props.totalXenBurned}`}
            ></iframe>
        </div>
    );
}