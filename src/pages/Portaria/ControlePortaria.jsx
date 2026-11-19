import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ListaAcesso from "./Componentes/ListaAcessos";

import { useNavigate } from "react-router-dom";

const icons = {
  relatorios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M3 3v18h18M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const panelItems = [
  {
    id: "ListaAcessos",
    title: "Lista de Acessos",
    icon: icons.relatorios,
    content: (
        <ListaAcesso />
    ),
  }
];

export default function ControlePortaria() {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("Baixa");
  const [descricao, setDescricao] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user')) ||  JSON.parse(sessionStorage.getItem('user'));
    setUser(storedUser || {});
  }, []);

  const visibleItems = panelItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.perfil);
  });

  useEffect(() => {
    if (!activeId && visibleItems.length > 0) {
      setActiveId(visibleItems[0].id);
    }
  }, [visibleItems, activeId]);

  const activeItem = visibleItems.find((item) => item.id === activeId);



  return (
    <div className="panel-wrapper" data-bs-theme="dark">
      <div className="d-flex" style={{ minHeight: "100vh" }}>

        {/* ===== SIDEBAR ===== */}
        <aside className="home-sidebar">
          <div>
            <div className="d-flex align-items-center gap-2 mb-4 px-1">
              <button
                className="btn btn-sm panel-back-btn d-flex align-items-center justify-content-center"
                onClick={() => navigate("/home")}
              >
                ←
              </button>
              <div className="panel-logo-mark d-flex align-items-center justify-content-center fw-bold">
                C
              </div>
              <span className="home-logo-text">ConectMaster</span>
            </div>

            <ul className="nav nav-pills flex-column gap-1">
              {visibleItems.map((item) => (
                <li className="nav-item" key={item.id}>
                  <button
                    className={`nav-link w-100 text-start d-flex align-items-center gap-2 panel-nav-link ${
                      activeId === item.id ? "active" : ""
                    }`}
                    onClick={() => setActiveId(item.id)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="d-flex align-items-center gap-2 pt-3 border-top border-secondary-subtle">
            <div className="panel-user-avatar d-flex align-items-center justify-content-center fw-semibold">
              {user?.nome?.[0]}
            </div>
            <div className="d-flex flex-column overflow-hidden">
              <span className="small fw-semibold text-truncate">
                {user?.nome || "Usuário"}
              </span>
              <span className="text-muted" style={{ fontSize: "11px" }}>
                {user?.perfil}
              </span>
            </div>
          </div>
        </aside>

        {/* ===== CONTEÚDO ===== */}
        <main className="flex-grow-1 p-5 panel-content">
          {activeItem ? (
            activeItem.content
          ) : (
            <p className="text-muted">Nenhum item disponível.</p>
          )}
        </main>
      </div>
    </div>
  );
}
