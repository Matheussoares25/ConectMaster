

import "./Themes/ThemePrincipal.css";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";

// Aplica o tema salvo antes de renderizar (evita "piscar" o tema errado)
document.documentElement.setAttribute(
  "data-theme",
  localStorage.getItem("tema") || "principal"
);

createRoot(document.getElementById("root")).render(<App />);