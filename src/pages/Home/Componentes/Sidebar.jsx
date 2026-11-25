import React, { useEffect, useState } from "react";
import CotacaoMoeda from "./BuscaMoedas";
import Config from "./Config";
import AcessosGeral from "../../Acessos/Acessos_geral";
import { icons } from "../../../Themes/icons";

const sidebarItems = [
  {
    id: "inicio",
    title: "Início",
    roles: "all",
    icon: icons.inicio,
    content: <AcessosGeral idContent={4} />,
  },
  {
    id: "outrosServicos",
    title: "Minha Agenda",
    icon: "> ",
    content: <div>Em breve</div>,
  },
  {
    id: "buscarMoedas",
    roles: "all",
    title: "Buscar valor Moedas",
    icon: icons.coins,
    content: (
      <div>
        <CotacaoMoeda />
      </div>
    ),
  },
  {
    id: "estoque",
    title: "Estoques",
    icon: icons.estoque,
    content: <AcessosGeral idContent={5} />,
  },
  {
    id: "ti",
    title: "TI",
    icon: icons.ti,
    content: <AcessosGeral idContent={3} />,
    idContent: 3,
  },
  {
    id: "compras",
    title: "Compras",
    icon: icons.compras,
    content: <AcessosGeral idContent={2} />,
    idContent: 2,
  },
  {
    id: "adm",
    title: "ADM",
    icon: icons.adm,
    content: <AcessosGeral idContent={1} />,
    idContent: 1,
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: icons.setings,
    content: <Config />,
  },
  {
    id: "portaria",
    title: "Portaria",
    icon: icons.ordinance,
    content: <AcessosGeral idContent={6} />,
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

  const fecharMenu = () => setSidebarOpen(false);

  const handclick = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    onLogout();
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
          <button className="home-sidebar-link" onClick={handleLogout}>
            <span className="home-sidebar-icon">⏻</span>
            <span className="home-sidebar-label">Sair</span>
          </button>
        </div>
      </aside>

      {/* ===== OVERLAY (fecha a gaveta ao tocar fora) ===== */}
      {sidebarOpen && (
        <div className="home-sidebar-overlay" onClick={fecharMenu} />
      )}

      {/* ===== CONTEÚDO ===== */}
      <main className="flex-grow-1 p-4">
        <header className="home-header">
          <div className="home-header-left">
            <button
              className="home-menu-toggle"
              aria-label="Abrir menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
          </div>

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

        {activeItem ? (
          activeItem.content
        ) : (
          <p className="text-muted">Nenhum item disponível.</p>
        )}
      </main>
    </div>
  );
}
