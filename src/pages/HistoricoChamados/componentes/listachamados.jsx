import React, { useEffect, useState } from "react";
import Api from "../../../Services/EndPoint";
import Swal from "sweetalert2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "../css/historico.css";

const prioridadeLabel = { 1: "Baixa", 2: "Média", 3: "Alta", 4: "Crítica" };

export default function HistoricoChamados() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [chamadoEditando, setChamadoEditando] = useState(null);

  useEffect(() => {
    carregarChamados();
  }, []);

  const handleStatusChange = async (id, status) => {
    console.log(chamadoEditando, status);
    Swal.fire({
      icon: "question",
      title: "Alterar Status",
      text: `Tem certeza que deseja alterar o status de: ${chamadoEditando.status} para: ${status}`,
      showCancelButton: true,
      confirmButtonText: "Sim, alterar",
      cancelButtonText: "Cancelar",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#ef5da8",
      cancelButtonColor: "#2a2f45",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      await Api.CallEndpoint(`Chamados/${id}`, "PUT", { status });
      await carregarChamados();
      Swal.fire({
        icon: "success",
        title: "Status alterado com sucesso!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      setChamadoEditando(null);
    });
  };

  const carregarChamados = async () => {
    setCarregando(true);
    try {
      const response = await Api.CallEndpoint("Chamados", "GET");
      setChamados(response?.chamados || response || []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível carregar os chamados.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } finally {
      setCarregando(false);
    }
  };

  const statusDisponiveis = [
    ...new Set(chamados.map((c) => c.status).filter(Boolean)),
  ];

  const chamadosFiltrados = chamados.filter((chamado) => {
    const bateTexto =
      !filtroTexto ||
      chamado.titulo?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      chamado.categoria?.toLowerCase().includes(filtroTexto.toLowerCase());

    const bateStatus = !filtroStatus || chamado.status === filtroStatus;
    const batePrioridade =
      !filtroPrioridade || String(chamado.prioridade) === filtroPrioridade;

    return bateTexto && bateStatus && batePrioridade;
  });

  const total = chamados.length;
  const abertos = chamados.filter((c) => c.status === "Aberto").length;
  const emAndamento = chamados.filter(
    (c) => c.status === "Em andamento",
  ).length;
  const concluidos = chamados.filter((c) => c.status === "Concluído").length;

  const dadosStatus = [
    {
      nome: "Aberto",
      total: abertos,
    },
    {
      nome: "Em andamento",
      total: emAndamento,
    },
    {
      nome: "Concluído",
      total: concluidos,
    },
    {
      nome: "Total",
      total: total,
    },
  ];

  const optionstatus = [
    "Aberto",
    "Em andamento",
    "Concluído",
    "Cancelado",
  ]

  const classeStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "aberto":
        return "hc-badge hc-badge--info";
      case "em andamento":
        return "hc-badge hc-badge--warning";
      case "concluído":
      case "concluido":
        return "hc-badge hc-badge--success";
      case "cancelado":
        return "hc-badge hc-badge--danger";
      default:
        return "hc-badge";
    }
  };

  const classePrioridade = (p) => `hc-badge hc-badge--prioridade-${p}`;

  const formatarData = (data) => {
    if (!data) return "—";
    const d = new Date(data);
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="hc-wrapper">
      <div className="mb-4">
        <h2 className="h4 fw-bold mb-1 hc-text-primary">
          Histórico de Chamados
        </h2>
        <p className="hc-text-muted mb-0">
          Consulte chamados abertos, em andamento ou finalizados.
        </p>
      </div>

      {/* ===== CARDS DE MÉTRICAS ===== */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="hc-card p-3">
            <p className="hc-text-muted mb-1 hc-metric-label">
              Total de chamados
            </p>
            <h3 className="hc-text-primary fw-bold mb-0">{total}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="hc-card p-3">
            <p className="hc-text-muted mb-1 hc-metric-label">Abertos</p>
            <h3
              className="fw-bold mb-0"
              style={{ color: "var(--color-primary)" }}
            >
              {abertos}
            </h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="hc-card p-3">
            <p className="hc-text-muted mb-1 hc-metric-label">Em andamento</p>
            <h3
              className="fw-bold mb-0"
              style={{ color: "var(--color-warning)" }}
            >
              {emAndamento}
            </h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="hc-card p-3">
            <p className="hc-text-muted mb-1 hc-metric-label">Concluídos</p>
            <h3
              className="fw-bold mb-0"
              style={{ color: "var(--color-success)" }}
            >
              {concluidos}
            </h3>
          </div>
        </div>
      </div>

      {/* ===== GRÁFICO POR PRIORIDADE ===== */}
      <div className="hc-card p-4 mb-4">
        <h3 className="h6 fw-semibold mb-3 hc-text-primary">
          Chamados por prioridade
        </h3>

        <div className="hc-card p-3">
          <h5 className="hc-text-primary">Chamados por status</h5>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosStatus}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="nome" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="total" fill="#46abe5" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== LISTA DE CHAMADOS ===== */}
      <div className="hc-card p-4">
        <h3 className="h6 fw-semibold mb-3 hc-text-primary">
          Chamados registrados
        </h3>

        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control hc-input"
              placeholder="Buscar por título ou categoria..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select hc-input"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {statusDisponiveis.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select hc-input"
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
            >
              <option value="">Todas as prioridades</option>
              <option value="1">Baixa</option>
              <option value="2">Média</option>
              <option value="3">Alta</option>
              <option value="4">Crítica</option>
            </select>
          </div>
        </div>

        {carregando ? (
          <p className="hc-text-muted mb-0">Carregando chamados...</p>
        ) : chamadosFiltrados.length === 0 ? (
          <p className="hc-text-muted mb-0">Nenhum chamado encontrado.</p>
        ) : (
          <div className="table-responsive">
            <table className="table hc-table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Usuário </th>
                  <th>Departamento</th>
                  <th>Categoria</th>
                  <th>Prioridade</th>
                  <th>Status</th>

                  <th className="text-end">Ações</th>
                  <th>Data de abertura</th>
                </tr>
              </thead>
              <tbody>
                {chamadosFiltrados.map((chamado) => {
                  const emEdicao = chamadoEditando?.id === chamado.id;

                  return (
                    <tr key={chamado.id}>
                      <td>{chamado.id}</td>
                      <td>{chamado.titulo}</td>
                      <td>{chamado.usuario.nome}</td>
                      <td>{chamado.usuario.setor}</td>
                      <td>{chamado.categoria}</td>
                      <td>
                        <span className={classePrioridade(chamado.prioridade)} >
                          {prioridadeLabel[chamado.prioridade] || "N/A"}
                        </span>
                      </td>

                      {emEdicao ? (
                        <React.Fragment>
                          <td>
                            <select
                              className="form-select form-select-sm hc-input"
                              value={chamado.status}
                              onChange={(e) =>
                                handleStatusChange(chamado.id, e.target.value)
                              }
                            >
                              {optionstatus.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setChamadoEditando(null)}
                            >
                              Cancelar
                            </button>
                          </td>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <td>
                            <span className={classeStatus(chamado.status)} onClick={() => setChamadoEditando(chamado)} style={{ cursor: 'pointer' }}>
                              {chamado.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm hc-btn-icon"
                              title="Editar status"
                              onClick={() => setChamadoEditando(chamado)}
                            >
                              ✎
                            </button>
                          </td>
                        </React.Fragment>
                      )}

                      <td className="text-nowrap">
                        {formatarData(chamado.dataAbertura)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="hc-text-muted mb-0 hc-footer-count">
          Exibindo {chamadosFiltrados.length} de {chamados.length} chamado(s).
        </p>
      </div>
    </div>
  );
}
