import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "./css/adm.css";
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

  servicos: (
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
        d="M4,4 L4,3 C4,1.89543 4.89543,1 6,1 L10,1 C11.1046,1 12,1.895431 12,3 L12,4 L14,4 C15.1046,4 16,4.89543 16,6 L16,13 C16,14.1046 15.1046,15 14,15 L2,15 C0.895431,15 0,14.1046 0,13 L0,6 C0,4.89543 0.895431,4 2,4 L4,4 Z M6,3 L10,3 L10,4 L6,4 L6,3 Z M2,6 L2,8 L14,8 L14,6 L2,6 Z M2,13 L2,10 L7,10 L7,11 L9,11 L9,10 L14,10 L14,13 L2,13 Z"
      />
    </svg>
  ),
  paineldecontrole: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M3 9l9-7 9 7M9 18V9M21 15V9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const menuItems = [
  {
    id: "ordemservico",
    title: "Abrir Serviço",
    description: "Registre um novo serviço solicitado",
    icon: icons.chamado,
    color: "primary",
    route: "/AbrirOrdemServico",
  },
  {
    id: "servicosgeral",
    title: "Histórico de Ordens de Servico",
    description:
      "Consulte ordens de serviço abertas, em andamento ou finalizadas",
    icon: icons.servicos,
    color: "success",
    route: "/HistoricoOrdemServico",
  },
  {
    id: "painelcontrole",
    title: "Painel de controle",
    description: "Acesse o painel de controle para gerenciar seus chamados",
    icon: icons.paineldecontrole,
    color: "success",
    route: "/painelControle",
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
      if (item.roles === "all") return true;

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
      <div className="adm-welcome">
        <h1 className="adm-title">Olá, {user?.nome || "bem-vindo de volta"}</h1>
        <p className="adm-subtitle">Recursos Administrativos disponíveis</p>
      </div>

      <div className="adm-grid">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`adm-card adm-card--${item.color}`}
            onClick={() => handleClickItem(item)}
          >
            <div className={`adm-card-icon adm-card-icon--${item.color}`}>
              {item.icon}
            </div>
            <h3 className="adm-card-title">{item.title}</h3>
            <p className="adm-card-description">{item.description}</p>
            <span className="adm-card-arrow">→</span>
          </button>
        ))}
      </div>
    </>
  );
}
