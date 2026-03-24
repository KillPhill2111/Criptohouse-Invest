import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./styles/global.css";

import Home from "./pages/Home";
import Coins from "./pages/Coins";
import Coin from "./pages/Coin";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coins" element={<Coins />} />
        <Route path="/coin/:exchange/:symbol" element={<Coin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;