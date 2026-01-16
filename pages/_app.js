// pages/_app.js
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    // Affiche les erreurs sur la page (utile pour iPhone)
    window.onerror = function (msg, url, line, col, error) {
      const box = document.createElement("div");
      box.style.position = "fixed";
      box.style.bottom = "0";
      box.style.left = "0";
      box.style.width = "100%";
      box.style.background = "red";
      box.style.color = "white";
      box.style.padding = "12px";
      box.style.fontSize = "14px";
      box.style.zIndex = "999999";
      box.innerText = "Erreur : " + msg;
      document.body.appendChild(box);
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;

