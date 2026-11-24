import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GerenciarDpMoveis from "./Componentes/GerenciarDpMoveis";

const panelItems = [
  {
    id: "cadastro",
    title: "Cadastrar aparelho",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "lista",
    title: "Aparelhos cadastrados",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function DpMoveisPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(panelItems[0].id);
  const [user] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user")) ||
        {}
      );
    } catch {
      return {};
    }
  });

  const activeItem = panelItems.find((item) => item.id === activeId);

  return (
    <div className="panel-wrapper" data-bs-theme="dark">
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        <aside className="home-sidebar">
          <div>
            <div className="d-flex align-items-center gap-2 mb-4 px-1">
              <button
                className="btn btn-sm panel-back-btn d-flex align-items-center justify-content-center"
                onClick={() => navigate("/home")}
                type="button"
                aria-label="Voltar para início"
              >
                ←
              </button>
              <div className="panel-logo-mark d-flex align-items-center justify-content-center fw-bold">
                C
              </div>
              <span className="home-logo-text">ConectMaster</span>
            </div>

            <ul className="nav nav-pills flex-column gap-1">
              {panelItems.map((item) => (
                <li className="nav-item" key={item.id}>
                  <button
                    className={`nav-link w-100 text-start d-flex align-items-center gap-2 panel-nav-link ${
                      activeId === item.id ? "active" : ""
                    }`}
                    onClick={() => setActiveId(item.id)}
                    type="button"
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
              {user?.nome?.[0] || "?"}
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

        <main className="flex-grow-1 p-5 panel-content">
          {activeItem ? (
            <GerenciarDpMoveis secao={activeItem.id} />
          ) : (
            <p className="text-muted">Nenhuma opção disponível.</p>
          )}
        </main>
      </div>
    </div>
  );
}
