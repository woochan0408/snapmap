import { Outlet } from "react-router-dom";
export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <Outlet />
    </div>
  );
}
