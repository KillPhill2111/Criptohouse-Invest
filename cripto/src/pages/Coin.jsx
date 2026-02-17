import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Coin() {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchCoin() {
    setLoading(true);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}`
    );

    const data = await res.json();
    setCoin(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCoin();
  }, [id]);

  return (
    <>
      <Header />

      <div style={{ padding: 20 }}>
        <Link to="/coins">← Voltar</Link>

        {loading && <p>Carregando...</p>}

        {coin && (
          <>
            <h1>{coin.name}</h1>
            <p>Rank: #{coin.market_cap_rank}</p>
            <p>
              Site:
              <a href={coin.links.homepage[0]} target="_blank" rel="noreferrer">
                {coin.links.homepage[0]}
              </a>
            </p>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}