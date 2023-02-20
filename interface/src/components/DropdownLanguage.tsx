import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const DropdownLanguage = () => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(JSON.parse(localStorage.getItem('language') || "en" ));

    useEffect(() => {
        localStorage.setItem('language', JSON.stringify(language));
    }, [language]);

    const handleLangChange = (event: any) => {
        const lang = event.target.value;
        setLanguage(lang);
        i18n.changeLanguage(event.target.value);
    };

    return (
        <select onChange={handleLangChange} value={language}>
            <option value="zh">ZH</option>
            <option value="en">EN</option>
        </select>
    );
};

export default DropdownLanguage;
