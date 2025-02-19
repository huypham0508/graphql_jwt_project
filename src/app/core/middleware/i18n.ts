import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "vi",
    preload: ["en", "vi"],
    backend: {
      loadPath: path.join(
        process.cwd(),
        "src/locales",
        "{{lng}}",
        "translation.json"
      ),
    },
    detection: {
      order: ["querystring", "header"],
    },
  });



export default i18next;
