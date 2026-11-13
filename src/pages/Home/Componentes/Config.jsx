import { useState } from "react";

const TEMAS = [
  { id: "principal", nome: "Padrão" },
  { id: "escuro", nome: "Escuro" },
  { id: "Master", nome: "Master" },
];

export default function SeletorTema() {
  const [tema, setTema] = useState(
    () => localStorage.getItem("tema") || "principal"
  );

  const trocar = (id) => {
    setTema(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("tema", id);
  };

  return (
    <select
      className="form-select"
      value={tema}
      onChange={(e) => trocar(e.target.value)}
    >
      {TEMAS.map((t) => (
        <option key={t.id} value={t.id}>{t.nome}</option>
      ))}
    </select>
  );
}