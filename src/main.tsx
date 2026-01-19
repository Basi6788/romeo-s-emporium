import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ⚠️ StrictMode hata diya hai taake Clerk Captcha crash na kare
createRoot(document.getElementById("root")!).render(<App />);

