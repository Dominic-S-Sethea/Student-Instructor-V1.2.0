import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StrictMode } from "react";
import "./index.css";

// Initialize CSRF token handling
// Reads the CSRF token ID from the meta tag set by the server
const csrfTokenId = document.getElementById("cdes-csrf-token-id")?.getAttribute("content");
if (csrfTokenId) {
  // Token ID is already set by the server response headers
  console.log("[CDES] CSRF token ID received from server");
} else {
  console.warn("[CDES] No CSRF token ID found - ensure server is configured with CSRF middleware");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
