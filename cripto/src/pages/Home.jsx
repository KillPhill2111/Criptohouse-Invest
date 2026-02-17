import Header from "../components/Header";
import Hero from "../components/Hero";
import Feature from "../components/Feature";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="page">
      <Header />
      <Hero />
      <Feature />
      <Footer />
    </div>
  );
}