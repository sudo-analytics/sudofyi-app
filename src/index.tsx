import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Collection from "./routes/Collection";

import "./index.css";
import "./base.css";

import reportWebVitals from "./reportWebVitals";
import { sendToVercelAnalytics } from "./vitals";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path=":collectionId" element={<Collection />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals(sendToVercelAnalytics);
