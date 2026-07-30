import React, { useEffect, useState } from "react";
import MenuMain from "./MenuMain";

const sidebarItems = [
  {
    id: "inicio",
    title: "Início",
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
    id: "configuracoes",
    title: "Configurações",
    icon: "⚙️",
    content: <div>Em breve</div>,
  },
];

export default function Sidebar({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(sidebarItems[0].id);
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    setUser(storedUser || {});
  }, []);

  const activeItem = sidebarItems.find((item) => item.id === activeId);

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
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`home-sidebar-link ${
                activeId === item.id ? "home-sidebar-link--active" : ""
              }`}
              onClick={() => setActiveId(item.id)}
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

        {activeItem ? (
          activeItem.content
        ) : (
          <p className="text-muted">Nenhum item disponível.</p>
        )}
      </main>
    </div>
  );
}