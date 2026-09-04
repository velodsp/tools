import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {Toaster} from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster position={"top-center"} toastOptions={{style: {maxWidth: 500}, duration: 10000}}/>
    <App/>
  </StrictMode>
);
