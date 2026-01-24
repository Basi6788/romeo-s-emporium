import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Maine wo 'vite-plugin-terminal' wali line hata di hai jo crash kar rahi thi.
// Ab ye seedha chalega.

createRoot(document.getElementById("root")!).render(<App />);

