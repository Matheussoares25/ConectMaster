import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaAcesso from "./Componentes/ListaAcessos";
import CadastroVeiculo from "./Componentes/CadastroVeiculo";
import "./PortariaControl.css";

const panelItems = [
  {
    id: "ListaAcessos",
    title: "Acessos cadastrados",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    content: <ListaAcesso />,
  },
  {
    id: "CadastroVeiculo",
    title: "Cadastrar veículo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
        <path d="M3 13l1.5-5h15L21 13v6h-2v-2H5v2H3v-6ZM5 13h14M7 17h.01M17 17h.01M7 8l1-3h8l1 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    content: <CadastroVeiculo />,
  },
];

export default function ControlePortaria() {
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
      <div className="d-flex portaria-control-layout">
        <aside className="home-sidebar">
          <div>
            <div className="d-flex align-items-center gap-2 mb-4 px-1">
              <button
                aria-label="Voltar para início"
                className="btn btn-sm panel-back-btn d-flex align-items-center justify-content-center"
                onClick={() => navigate("/home")}
                type="button"
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
                    aria-current={activeId === item.id ? "page" : undefined}
                    className={`nav-link w-100 text-start d-flex align-items-center gap-2 panel-nav-link ${activeId === item.id ? "active" : ""}`}
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
              <span className="small fw-semibold text-truncate">{user?.nome || "Usuário"}</span>
              <span className="text-muted" style={{ fontSize: "11px" }}>{user?.perfil || ""}</span>
            </div>
          </div>
        </aside>

        <main className="flex-grow-1 p-5 panel-content">
          {activeItem ? activeItem.content : <p className="text-muted">Nenhuma opção disponível.</p>}
        </main>
      </div>
    </div>
  );
}
