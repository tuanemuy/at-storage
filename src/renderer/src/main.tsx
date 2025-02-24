import "./assets/panda.css";
import "./assets/global.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./store/Provider";

const isDarkMode =
  window?.matchMedia?.("(prefers-color-scheme:dark)")?.matches ?? false;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StoreProvider initialValues={{ isDarkMode }}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
);
