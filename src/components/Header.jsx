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
        <img
          src="./icon.png"
          alt="AutoMap Logo"
          className="logo-icon"
          style={{ width: 48, height: 48, cursor: "pointer" }}
          onClick={handleLogoClick}
        />
        <span className="logo-text" onClick={handleLogoClick}>
          AUTO MAP
        </span>
      </div>
    </header>
  );
}
