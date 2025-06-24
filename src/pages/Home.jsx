import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  return (
    <button
      style={{ fontSize: 24, padding: "12px 24px" }}
      onClick={() => nav("/drawing")}
    >
      도면 열람
    </button>
  );
}
