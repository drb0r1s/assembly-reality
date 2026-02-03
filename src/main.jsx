import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./style/main.css";
import ContextWrapper from "./context/ContextWrapper";

const root = document.getElementById("root");

createRoot(root).render(
    <BrowserRouter>
        <ContextWrapper>
            <App />
        </ContextWrapper>
    </BrowserRouter>
);