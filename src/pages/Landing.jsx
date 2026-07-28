import "./Landing.css";
import Nav from "../components/Nav.jsx";
import Hero from "../components/Hero.jsx";  
import HowItWorks from "../components/HowItWorks.jsx";
import Delivery from "../components/Delivery.jsx";
import Cta from "../components/Cta.jsx";
import Footer from "../components/Footer.jsx";

export default function Landing() {
  return (
    <div className="fn-page">
      <div className="fn-bg-glow" aria-hidden="true">
        <div className="fn-bg-glow-top" />
        <div className="fn-bg-glow-orb" />
      </div>

      <Nav />
      <Hero />         
      <HowItWorks />
      <Delivery />    
      <Cta />
      <Footer />
    </div>
  );
}

