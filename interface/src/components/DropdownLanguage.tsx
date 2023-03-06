import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const DropdownLanguage = () => {
    const { i18n, t } = useTranslation();
    const [language, setLanguage] = useState(JSON.parse(localStorage.getItem('language') || "null" ));

    useEffect(() => {
        localStorage.setItem('language', JSON.stringify(language));
    }, [language]);

    const handleLangChange = (event: any) => {
        const lang = event.target.value;
        setLanguage(lang);
        i18n.changeLanguage(event.target.value);
    };

    return (
        <select onChange={handleLangChange} value={language} className="language-switcher">
            <option value="en">{t("app_bar.language.english")}</option>
            <option value="zh">{t("app_bar.language.chinese")}</option>
        </select>
    );
};

export default DropdownLanguage;
