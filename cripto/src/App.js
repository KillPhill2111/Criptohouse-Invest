import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./styles/global.css";

import Home from "./pages/Home";
import Coins from "./pages/Coins";
import Coin from "./pages/Coin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coins" element={<Coins />} />
        <Route path="/coin/:id" element={<Coin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
