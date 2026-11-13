import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "./css/compras.css";
const icons = {
  chamado: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8-1.5 0-2.91-.32-4.15-.9L3 20l1.05-3.5C3.38 15.24 3 13.66 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  historico: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 8v5l3 2M21 12a9 9 0 11-3.5-7.11M21 4v5h-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  compras: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#000000"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4,4 L4,3 C4,1.89543 4.89543,1 6,1 L10,1 C11.1046,1 12,1.895431 12,3 L12,4 L14,4 C15.1046,4 16,4.89543 16,6 L16,13 C16,14.1046 15.1046,15 14,15 L2,15 C0.895431,15 0,14.1046 0,13 L0,6 C0,4.89543 0.895431,4 2,4 L4,4 Z M6,3 L10,3 L10,4 L6,4 L6,3 Z M2,6 L2,8 L14,8 L14,6 L2
,6 Z M2,13 L2,10 L7,10 L7,11 L9,11 L9,10 L14,10 L14,13 L2,13 Z"
      />
    </svg>
  ),
};

const menuItems = [
  {
    id: "solicitarcompra",
    title: "Solicitar Compra",
    description: "Registre uma nova solicitação de compra",
    icon: icons.compras,
    color: "primary",
    route: "/solicitarcompra",
  },
  {
    id: "historicochamados",
    title: "Histórico de Chamados",
    description: "Consulte chamados abertos, em andamento ou finalizados",
    icon: icons.historico,
    color: "success",
    route: "/historicochamados",
  },
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
      <div className="Compras-welcome">
        <h1 className="Compras-title">
          Olá, {user?.nome || "bem-vindo de volta"}
        </h1>
        <p className="Compras-subtitle">Recursos Compras disponíveis</p>
      </div>

      <div className="Compras-grid">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`Compras-card Compras-card--${item.color}`}
            onClick={() => handleClickItem(item)}
          >
            <div
              className={`Compras-card-icon Compras-card-icon--${item.color}`}
            >
              {item.icon}
            </div>
            <h3 className="Compras-card-title">{item.title}</h3>
            <p className="Compras-card-description">{item.description}</p>
            <span className="Compras-card-arrow">→</span>
          </button>
        ))}
      </div>
    </>
  );
}
