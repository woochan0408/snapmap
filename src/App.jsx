import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import BackToTop from "./components/BackToTop";
import "./styles/Global.css";

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <BackToTop />
    </div>
  );
}
