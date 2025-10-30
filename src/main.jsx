import { createRoot } from "react-dom/client";
import App from "./App";
import "./style/main.css";
import ContextWrapper from "./context/ContextWrapper";

const root = document.getElementById("root");

createRoot(root).render(
    <ContextWrapper>
        <App />
    </ContextWrapper>
);