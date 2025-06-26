import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate("/");
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section" onClick={handleLogoClick}>
          <img src="/icon.png" alt="AutoMap Logo" className="logo-icon" />
          <span className="logo-text">AUTO MAP</span>
        </div>
        
        <nav className="nav-section">
          <button 
            className={`nav-button ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => navigate("/")}
          >
            홈
          </button>
          <button 
            className={`nav-button ${location.pathname === "/drawing" ? "active" : ""}`}
            onClick={() => navigate("/drawing")}
          >
            도면 열람
          </button>
        </nav>
      </div>
    </header>
  );
}