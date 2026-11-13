import React, { useEffect, useState } from "react";
import MenuMain from "./MenuMain";
import CotacaoMoeda from "./BuscaMoedas";
import EstoquesMain from "./EstoquesMain";
import Ti from "../../Componentes_TI/Acessos_TI";
import Adm from "../../Componentes_Adm/Acessos_adm";
import Config from "./Config";
import Compras from "../../Componentes_Compras/Acessos_Compras";

const sidebarItems = [
  {
    id: "inicio",
    title: "Início",
    roles: "all",
    icon: "🏠",
    content: <MenuMain />,
  },
  {
    id: "outrosServicos",
    title: "Minha Agenda",
    icon: "👥",
    content: <div>Em breve</div>,
  },
  {
    id: "buscarMoedas",
    roles: "all",
    title: "Buscar valor Moedas",
    icon: "🪙",
    content: (
      <div>
        <CotacaoMoeda />
      </div>
    ),
  },
  {
    id: "estoque",
    title: "Estoques",
    icon: "📦",
    content: (
      <div>
        <EstoquesMain />
      </div>
    ),
  },
  {
    id: "ti",
    title: "TI",
    icon: "💻",
    content: (
      <div>
        <Ti />
      </div>
    ),
  },
  {
    id: "adm",
    title: "ADM",
    icon: "💰",
    content: (
      <div>
        <Adm />
      </div>
    ),
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: "⚙️",
    content: <Config />,
  },
  {
    id: "compras",
    title: "Compras",
    icon: "🛒",
    content: <Compras />,
  },
];
const ultimaView = "ultimasViews";

export default function Sidebar({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(() => {
    const salvo = localStorage.getItem(ultimaView);
    const valido = sidebarItems.some((item) => item.id === salvo);
    return valido ? salvo : sidebarItems[0].id;
  });
  const [user, setUser] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    setUser(storedUser || {});
  }, []);

  useEffect(() => {
    localStorage.setItem(ultimaView, activeId);
  }, [activeId]);

  const handclick = (id) => {
    setActiveId(id);
  };

  const views = JSON.parse(localStorage.getItem("views")) || [];
  const viewsLimpa = views.map((v) => v.replace("visual.", ""));

  const itens = sidebarItems.filter((item) => {
    if (item.roles === "all") return true;

    const permitidoPorView = viewsLimpa.includes(item.id);

    const permitidoPorRole =
      !item.roles || item.roles.includes(storedUser?.perfil);

    return permitidoPorView && permitidoPorRole;
  });

  const activeItem =
    sidebarItems.find((item) => item.id === activeId) || sidebarItems[0];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`home-sidebar ${sidebarOpen ? "home-sidebar--open" : ""}`}
      >
        <div className="home-sidebar-header">
          <div className="home-logo-mark">C</div>
          <span className="home-logo-text">ConectMaster</span>
        </div>

        <nav className="home-sidebar-nav">
          {itens.map((item) => (
            <button
              key={item.id}
              className={`home-sidebar-link ${
                activeId === item.id ? "home-sidebar-link--active" : ""
              }`}
              onClick={() => handclick(item.id)}
            >
              <span className="home-sidebar-icon">{item.icon}</span>
              <span className="home-sidebar-label">{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="home-sidebar-footer">
          <button className="home-sidebar-link" onClick={onLogout}>
            <span className="home-sidebar-icon">⏻</span>
            <span className="home-sidebar-label">Sair</span>
          </button>
        </div>
      </aside>

      {/* ===== CONTEÚDO ===== */}
      <main className="flex-grow-1 p-4">
        <header className="home-header">
          <div className="home-header-left" />

          <div className="home-user">
            <div className="home-user-avatar">
              {user?.nome?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="home-user-info">
              <span className="home-user-name">{user?.nome || "Usuário"}</span>
              <span className="home-user-role">{user?.perfil}</span>
            </div>
          </div>
        </header>

        {activeItem || ultimasViews.length > 0 ? (
          activeItem.content
        ) : (
          <p className="text-muted">Nenhum item disponível.</p>
        )}
      </main>
    </div>
  );
}
