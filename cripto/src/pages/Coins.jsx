import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Coins() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchCoins() {
    setLoading(true);

    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1"
    );

    const data = await res.json();
    setCoins(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCoins();
  }, []);

  const filtered = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />

      <div style={{ padding: 20 }}>
        <h1>Mercado Cripto</h1>

        <Link to="/">← Voltar</Link>

        <div style={{ margin: "20px 0" }}>
          <input
            placeholder="Buscar moeda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 8, width: 250 }}
          />

          <button onClick={fetchCoins} style={{ marginLeft: 10 }}>
            Atualizar
          </button>
        </div>

        {loading && <p>Carregando...</p>}

        {!loading &&
          filtered.map((coin) => (
            <div
              key={coin.id}
              style={{
                border: "1px solid #ccc",
                padding: 15,
                marginBottom: 10,
                borderRadius: 8,
              }}
            >
              <strong>{coin.name}</strong> ({coin.symbol.toUpperCase()})
              <p>Preço: ${coin.current_price}</p>

              <Link to={`/coin/${coin.id}`}>Ver detalhes</Link>
            </div>
          ))}
      </div>

      <Footer />
    </>
  );
}