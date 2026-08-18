import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import APi from "../../Services/EndPoint";
import { useNavigate } from "react-router-dom";
import "./css/historicoOS.css";

const icons = {
  dashboard: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="18"
      height="18"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  lista: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="18"
      height="18"
    >
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

// Ajuste os nomes/valores de status conforme o seu backend
const STATUS = {
  PENDENTE: "Aberta",
  APROVADO: "Aprovada",
  REPROVADO: "Reprovada",
};

function StatusBadge({ status }) {
  const map = {
    [STATUS.PENDENTE]: "badge-status--pendente",
    [STATUS.APROVADO]: "badge-status--aprovado",
    [STATUS.REPROVADO]: "badge-status--reprovado",
  };
  return <span className={`badge-status ${map[status] || ""}`}>{status}</span>;
}

function DashboardServicos({ servicos, loading }) {
  const stats = useMemo(() => {
    const total = servicos?.length;
    const pendentes = servicos?.filter(
      (s) => s.status === STATUS.PENDENTE,
    ).length;
    const aprovados = servicos?.filter(
      (s) => s.status === STATUS.APROVADO,
    ).length;
    const reprovados = servicos?.filter(
      (s) => s.status === STATUS.REPROVADO,
    ).length;
    return { total, pendentes, aprovados, reprovados };
  }, [servicos]);

  const cards = [
    { label: "Total de solicitações", value: stats.total, color: "primary" },
    { label: "Pendentes", value: stats.pendentes, color: "warning" },
    { label: "Aprovados", value: stats.aprovados, color: "success" },
    { label: "Reprovados", value: stats.reprovados, color: "danger" },
  ];

  if (loading) {
    return <p className="text-muted">Carregando dashboard...</p>;
  }

  return (
    <div>
      <h2 className="h4 fw-semibold mb-4">Dashboard de Serviços</h2>
      <div className="row g-3">
        {cards.map((card) => (
          <div className="col-6 col-lg-3" key={card.label}>
            <div className={`dash-card dash-card--${card.color}`}>
              <span className="dash-card-value">{card.value}</span>
              <span className="dash-card-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListaSolicitacoes({
  servicos,
  loading,
  onAprovar,
  onReprovar,
  processingId,
}) {
  if (loading) {
    return <p className="text-muted">Carregando solicitações...</p>;
  }

  if (servicos.length === 0) {
    return <p className="text-muted">Nenhuma solicitação encontrada.</p>;
  }

  return (
    <div>
      <h2 className="h4 fw-semibold mb-4">Solicitações de Serviço</h2>
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Solicitante</th>
              <th>Status</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.titulo}</td>
                <td>{s.usuario?.nome || "-"}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td className="text-end">
                  {s.status === STATUS.PENDENTE ? (
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        className="btn btn-sm btn-outline-success"
                        disabled={processingId === s.id}
                        onClick={() => onAprovar(s)}
                      >
                        {processingId === s.id ? "..." : "Aprovar"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={processingId === s.id}
                        onClick={() => onReprovar(s)}
                      >
                        {processingId === s.id ? "..." : "Reprovar"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted small">Sem ações</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HistoricoServicos() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeId, setActiveId] = useState("Dashboard");
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    setUser(storedUser || {});
  }, []);

  const carregarServicos = async () => {
    setLoading(true);
    try {
      const data = await APi.CallEndpoint("Servicos");
      setServicos(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar",
        text: "Não foi possível carregar as solicitações de serviço.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  const atualizarStatus = async (servico, novoStatus, labelAcao) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: `${labelAcao} solicitação?`,
      text: `Tem certeza que deseja ${labelAcao.toLowerCase()} a solicitação "${
        servico.titulo
      }"?`,
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    setProcessingId(servico.id);
    try {
      const servicoAtualizado = { ...servico, status: novoStatus };

      await APi.CallEndpoint(`Servicos`, "PUT", servicoAtualizado, servico.id);

      setServicos((prev) =>
        prev.map((s) => (s.id === servico.id ? servicoAtualizado : s)),
      );

      Swal.fire({
        icon: "success",
        title: `Solicitação ${novoStatus.toLowerCase()}!`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: `Não foi possível ${labelAcao.toLowerCase()} a solicitação.`,
      });
    } finally {
      setProcessingId(null);
    }
  };
  const handleAprovar = (servico) =>
    atualizarStatus(servico, STATUS.APROVADO, "Aprovar");

  const handleReprovar = (servico) =>
    atualizarStatus(servico, STATUS.REPROVADO, "Reprovar");

  const panelItems = [
    {
      id: "Dashboard",
      title: "Dashboard",
      icon: icons.dashboard,
      content: <DashboardServicos servicos={servicos} loading={loading} />,
    },
    {
      id: "Solicitacoes",
      title: "Solicitações",
      icon: icons.lista,
      content: (
        <ListaSolicitacoes
          servicos={servicos}
          loading={loading}
          onAprovar={handleAprovar}
          onReprovar={handleReprovar}
          processingId={processingId}
        />
      ),
    },
  ];

  const activeItem = panelItems.find((item) => item.id === activeId);

  return (
    <div className="panel-wrapper" data-bs-theme="dark">
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        {/* ===== SIDEBAR ===== */}
        <aside className="panel-sidebar d-flex flex-column justify-content-between p-3">
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
              <span className="fw-semibold">ConectMaster</span>
            </div>

            <ul className="nav nav-pills flex-column gap-1">
              {panelItems.map((item) => (
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
