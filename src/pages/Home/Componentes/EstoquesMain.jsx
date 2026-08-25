import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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
  ordemServico: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M9 12h6M9 16h6M9 8h1M4 6a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
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
  uber: (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.0"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.19729 2.69839C2.82994 1.64467 3.96894 1 5.19799 1H9.80201C11.0311 1 12.1701 1.64467 12.8027 2.69839L15 6.35813V12.5C15 13.3284 14.3284 14 13.5 14H12.5C11.6716 14 11 13.3284 11 12.5V12H4V12.5C4 13.3284 3.32843 14 2.5 14H1.5C0.671573 14 0 13.3284 0 12.5V6.35813L2.19729 2.69839ZM12 7H3V6H12V7ZM2 10H5V9H2V10ZM13 9H10V10H13V9Z"
        fill="#000000"
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
  Tec: (
    <svg
      fill="#000000"
      height="800"
      width="18"
      version="1.1"
      id="Icons"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      xml:space="preserve"
    >
      <path
        d="M29.9,17.5C29.7,17.2,29.4,17,29,17c-2.2,0-4.3,1-5.6,2.8L22.5,21c-1.1,1.3-2.8,2-4.5,2h-3c-0.6,0-1-0.4-1-1s0.4-1,1-1h1.9
	c1.6,0,3.1-1.3,3.1-2.9c0,0,0-0.1,0-0.1c0-0.5-0.5-1-1-1l-6.1,0c-3.6,0-6.5,1.6-8.1,4.2l-2.7,4.2c-0.2,0.3-0.2,0.7,0,1l3,5
	c0.1,0.2,0.4,0.4,0.6,0.5c0.1,0,0.1,0,0.2,0c0.2,0,0.4-0.1,0.6-0.2c3.8-2.5,8.2-3.8,12.7-3.8c3.3,0,6.3-1.8,7.9-4.7l2.7-4.8
	C30,18.2,30,17.8,29.9,17.5z"
      />
      <path
        d="M4.5,18c0.1,0,0.3,0,0.4,0c1.2-1.1,2.7-1.9,4.3-2.4C9.1,15.1,9,14.5,9,14c0-4.4,3.6-8,8-8s8,3.6,8,8c0,0.7-0.1,1.4-0.3,2.1
	C26,15.4,27.5,15,29,15c0.7,0,1.4,0.3,1.9,0.7C31,15.1,31,14.6,31,14c0-1.1-0.1-2.2-0.4-3.3c-0.1-0.5-0.6-0.8-1.1-0.8
	c-1.2,0.2-2.4-0.4-3-1.5c-0.6-1-0.5-2.4,0.2-3.3c0.3-0.4,0.3-1-0.1-1.3C25,2.3,23.1,1.2,21,0.6c-0.5-0.1-1,0.1-1.2,0.6
	C19.3,2.3,18.2,3,17,3s-2.3-0.7-2.8-1.8C14,0.7,13.5,0.4,13,0.6C10.9,1.2,9,2.3,7.4,3.9C7,4.2,7,4.8,7.3,5.2c0.7,1,0.8,2.3,0.2,3.3
	c-0.6,1-1.8,1.6-3,1.5c-0.5-0.1-1,0.3-1.1,0.8C3.1,11.8,3,12.9,3,14s0.1,2.2,0.4,3.3C3.5,17.8,4,18.1,4.5,18z"
      />
    </svg>
  ),
};

const menuItems = [
  {
    id: "estoqueTi",
    title: "Estoque Ti",
    description: "Estoques de itens de TI",
    icon: icons.Tec,
    color: "#000000",
    route: "/estoque/estoque-ti",
  },
];

export default function EstoquesMain() {
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
      <div className="home-welcome">
        <h1 className="home-title">
          Olá, {user?.nome || "bem-vindo de volta"}
        </h1>
        <p className="home-subtitle">O que você precisa fazer hoje?</p>
      </div>

      <div className="home-grid">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`home-card home-card--${item.color}`}
            onClick={() => handleClickItem(item)}
          >
            <div className={`home-card-icon home-card-icon--${item.color}`}>
              {item.icon}
            </div>
            <h3 className="home-card-title">{item.title}</h3>
            <p className="home-card-description">{item.description}</p>
            <span className="home-card-arrow">→</span>
          </button>
        ))}
      </div>
    </>
  );
}
