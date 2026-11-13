import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "./css/Ti.css";
const icons = {
  chamado: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8-1.5 0-2.91-.32-4.15-.9L3 20l1.05-3.5C3.38 15.24 3 13.66 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
 
  historico: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M12 8v5l3 2M21 12a9 9 0 11-3.5-7.11M21 4v5h-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
 
};

const menuItems = [
  {
    id: "abrirchamado",
    title: "Abrir Chamado",
    description: "Registre um novo chamado de suporte técnico",
    icon: icons.chamado,
    color: "primary",
    route: "/abrirChamado",
  },
  {
    id: "historicochamados",
    title: "Histórico de Chamados",
    description: "Consulte chamados abertos, em andamento ou finalizados",
    icon: icons.historico,
    color: "success",
    route: "/historicochamados",
  }



];

export default function Acessos() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    setUser(storedUser || {});

    const views = JSON.parse(localStorage.getItem("views")) || [];
    const viewsLimpa = views.map((v) => v.replace("visual.", ""));

    const items = menuItems.filter((item) => {
      const permitidoPorView = viewsLimpa.includes(item.id);
      const permitidoPorRole =
        !item.roles || item.roles.includes(storedUser?.perfil);
      return permitidoPorView && permitidoPorRole;
    });

    setVisibleItems(items);
  }, []);

  const handleClickItem = (item) => {
    if (item.route) {
      navigate(item.route);
    }
  };

return (
  <>
    <div className="ti-welcome">
      <h1 className="ti-title">Olá, {user?.nome || "bem-vindo de volta"}</h1>
      <p className="ti-subtitle">Recursos Ti disponíveis</p>
    </div>

    <div className="ti-grid">
      {visibleItems.map((item) => (
        <button
          key={item.id}
          className={`ti-card ti-card--${item.color}`}
          onClick={() => handleClickItem(item)}
        >
          <div className={`ti-card-icon ti-card-icon--${item.color}`}>
            {item.icon}
          </div>
          <h3 className="ti-card-title">{item.title}</h3>
          <p className="ti-card-description">{item.description}</p>
          <span className="ti-card-arrow">→</span>
        </button>
      ))}
    </div>
  </>
);
}