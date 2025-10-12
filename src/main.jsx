import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./style/main.css";
import { store } from "./state/store";

const root = document.getElementById("root");

createRoot(root).render(
    <Provider store={store}>
        <App />
    </Provider>
);