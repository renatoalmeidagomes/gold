import Header from "../components/Header";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import About from "../components/About";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-black">
      <Header />
      <Hero />
      <ProductGrid />
      <About />
      <Footer />
    </main>
  );
}


