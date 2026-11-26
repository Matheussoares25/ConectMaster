import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Api, { swalBase } from "../../../../Services/EndPoint";
import CadastroEmail from "./Componentes/CadastroEmail";
import ListaEmails from "./Componentes/ListaEmails";
import "./Emails.css";

const panelItems = [
  {
    id: "cadastroemail",
    title: "Cadastrar e-mail",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    content: <CadastroEmail />,
  },
  {
    id: "listaemails",
    title: "E-mails cadastrados",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    content: <ListaEmails />,
  },
];

export default function EmailsPage() {
  const navigate = useNavigate();
  const [views, setViews] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [carregandoViews, setCarregandoViews] = useState(true);
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

  useEffect(() => {
    let mounted = true;

    const carregarViews = async () => {
      try {
        const resposta = await Api.CallEndpoint("UsuarioView/me", "GET");
        if (!Array.isArray(resposta)) {
          throw new Error("A API não retornou uma lista válida de views.");
        }
        if (!mounted) return;

        const viewsNormalizadas = resposta.map((view) => view.replace(/^visual\./, ""));
        setViews(viewsNormalizadas);
        setActiveId(panelItems.find((item) => viewsNormalizadas.includes(item.id))?.id ?? null);
      } catch (error) {
        if (mounted) {
          Swal.fire({
            ...swalBase,
            icon: "error",
            title: "Erro ao carregar permissões",
            text: error.message || "Não foi possível verificar o acesso às opções de e-mail.",
          });
        }
      } finally {
        if (mounted) setCarregandoViews(false);
      }
    };

    carregarViews();
    return () => {
      mounted = false;
    };
  }, []);

  const itensVisiveis = panelItems.filter((item) => views.includes(item.id));
  const activeItem = itensVisiveis.find((item) => item.id === activeId);

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
              {itensVisiveis.map((item) => (
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
          {carregandoViews ? (
            <p className="text-muted" role="status">Carregando permissões...</p>
          ) : !itensVisiveis.length ? (
            <p className="text-muted">Você não tem acesso às opções de cadastro ou listagem de e-mails.</p>
          ) : activeItem ? (
            activeItem.content
          ) : (
            <p className="text-muted">Nenhuma opção disponível.</p>
          )}
        </main>
      </div>
    </div>
  );
}
