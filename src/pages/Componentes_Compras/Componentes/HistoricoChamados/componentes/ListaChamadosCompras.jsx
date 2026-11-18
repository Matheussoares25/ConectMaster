import React, { useEffect, useState } from "react";
import Api from "../../../../../Services/EndPoint";
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

export default function ListaChamadosCompras() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [chamadoEditando, setChamadoEditando] = useState(null);
  const [graficoAberto, setGraficoAberto] = useState(null);
  const [chamadoSolicitandoAprovacao, setChamadoSolicitandoAprovacao] =
    useState(null);

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

      try {
        if (status === "Concluído") {
          await Api.CallEndpoint(`ChamadosCompras/${id}/fechar`, "PUT", {
            status,
          });
          await carregarChamados();
          Swal.fire({
            icon: "success",
            title: "Chamado concluido com sucesso!",
            background: "#141826",
            color: "#fff",
            confirmButtonColor: "#2f6fed",
          });
          setChamadoEditando(null);
          return;
        }

        await Api.CallEndpoint(`ChamadosCompras/${id}`, "PUT", { status });
        await carregarChamados();
        Swal.fire({
          icon: "success",
          title: "Status alterado com sucesso!",
          background: "#141826",
          color: "#fff",
          confirmButtonColor: "#2f6fed",
        });
        setChamadoEditando(null);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: error?.message || "Não foi possível alterar o status.",
          background: "#141826",
          color: "#fff",
          confirmButtonColor: "#2f6fed",
        });
      }
    });
  };

  const carregarChamados = async () => {
    setCarregando(true);
    try {
      const response = await Api.CallEndpoint("ChamadosCompras", "GET");
      setChamados(response?.chamados || response || []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error?.message,
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } finally {
      setCarregando(false);
    }
  };

  const solicitarAprovacao = async (chamado) => {
    const confirmacao = await Swal.fire({
      icon: "question",
      title: "Solicitar standby?",
      text: `Deseja enviar o chamado "${chamado.titulo}" para standby?`,
      showCancelButton: true,
      confirmButtonText: "Solicitar standby",
      cancelButtonText: "Cancelar",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#2f6fed",
      cancelButtonColor: "#2a2f45",
    });

    if (!confirmacao.isConfirmed) return;

    setChamadoSolicitandoAprovacao(chamado.id);
    try {
      await Api.CallEndpoint(
        `ChamadosCompras/${chamado.id}/standby`,
        "PATCH",
      );
      setChamados((anteriores) =>
        anteriores.map((item) =>
          item.id === chamado.id ? { ...item, standby: true } : item,
        ),
      );
      Swal.fire({
        icon: "success",
        title: "Standby solicitado",
        text: "O chamado foi enviado para standby.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error?.message || "Não foi possível solicitar o standby.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } finally {
      setChamadoSolicitandoAprovacao(null);
    }
  };

  const ApagarChamado = async (id) => {
    Swal.fire({
      icon: "question",
      title: "Apagar Chamado",
      text: "Tem certeza que deseja apagar este chamado?",
      showCancelButton: true,
      confirmButtonText: "Sim, apagar",
      cancelButtonText: "Cancelar",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#ef5da8",
      cancelButtonColor: "#2a2f45",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      await Api.CallEndpoint(`ChamadosCompras/${id}`, "DELETE");
      await carregarChamados();
      Swal.fire({
        icon: "success",
        title: "Chamado apagado com sucesso!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    });
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

  const optionstatus = ["Aberto", "Em andamento", "Concluído", "Cancelado"];

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
          Histórico de Chamados de Compras
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
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => setGraficoAberto(!graficoAberto)}
        >
          <h3 className="h6 fw-semibold mb-0 hc-text-primary">
            Grafico chamados
          </h3>

          <span className="chamado-button">
            {graficoAberto ? "Recolher Grafico" : "Expandir Grafico"}
          </span>
        </div>

        {graficoAberto && (
          <div className="mt-3">
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
        )}
      </div>

      {/* ===== LISTA DE CHAMADOS ===== */}
      <div className="hc-card p-4">
        <h3 className="h6 fw-semibold mb-3 hc-text-primary">
          Chamados de Compras registrados
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
                  <th>Descrição</th>
                  <th>Usuário </th>
                  <th>Departamento</th>
                  <th>E-mail</th>
                  <th>Categoria</th>
                  <th>Prioridade</th>
                  <th>Aprovado</th>
                  <th>Standby</th>
                  <th>Data de aprovação</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                  <th>Data de abertura</th>
                  <th>Data de conclusão</th>
                </tr>
              </thead>
              <tbody>
                {chamadosFiltrados.map((chamado) => {
                  const emEdicao = chamadoEditando?.id === chamado.id;

                  return (
                    <tr key={chamado.id}>
                      <td>{chamado.id}</td>
                      <td>{chamado.titulo}</td>
                      <td className="text-break">{chamado.descricao || "—"}</td>
                      <td>{chamado.usuario?.nome || "—"}</td>
                      <td>
                        {chamado.usuario?.departamentoNome ||
                          chamado.setor ||
                          "—"}
                      </td>
                      <td>{chamado.email || chamado.usuario?.email || "—"}</td>
                      <td>{chamado.categoria}</td>

                      <td>
                        <span className={classePrioridade(chamado.prioridade)}>
                          {prioridadeLabel[chamado.prioridade] || "N/A"}
                        </span>
                      </td>
                      <td>
                        {chamado.aprovado ? (
                          <span
                            className="hc-badge hc-badge--success d-inline-flex align-items-center gap-1"
                            title="Aprovado pela gestão"
                            aria-label="Aprovado pela gestão"
                          >
                            <svg
                              viewBox="0 0 16 16"
                              width="14"
                              height="14"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm3.54 5.96-4 4a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06L7 8.36l3.47-3.46a.75.75 0 1 1 1.06 1.06Z" />
                            </svg>
                            Gestão
                          </span>
                        ) : (
                          <span className="hc-badge">Não</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            chamado.standby
                              ? "hc-badge hc-badge--warning"
                              : "hc-badge"
                          }
                        >
                          {chamado.standby ? "Sim" : "Não"}
                        </span>
                      </td>
                      <td className="text-nowrap">
                        {formatarData(chamado.dataAprovacao)}
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
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setChamadoEditando(null)}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                disabled={
                                  chamado.aprovado ||
                                  chamado.standby ||
                                  chamadoSolicitandoAprovacao === chamado.id
                                }
                                onClick={() => solicitarAprovacao(chamado)}
                              >
                                {chamado.aprovado
                                  ? "Aprovado"
                                  : chamado.standby
                                    ? "Aguardando gestão"
                                    : chamadoSolicitandoAprovacao === chamado.id
                                      ? "Enviando..."
                                      : "Solicitar aprovação"}
                              </button>
                            </div>
                          </td>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <td>
                            <span
                              className={classeStatus(chamado.status)}
                              onClick={() => setChamadoEditando(chamado)}
                              style={{ cursor: "pointer" }}
                            >
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
                            <button
                              className="btn btn-sm hc-btn-icon"
                              title="Apagar chamado"
                              onClick={() => ApagarChamado(chamado.id)}
                            >
                              🗑️
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary ms-2"
                              disabled={
                                chamado.aprovado ||
                                chamado.standby ||
                                chamadoSolicitandoAprovacao === chamado.id
                              }
                              onClick={() => solicitarAprovacao(chamado)}
                            >
                              {chamado.aprovado
                                ? "Aprovado"
                                : chamado.standby
                                  ? "Aguardando gestão"
                                  : chamadoSolicitandoAprovacao === chamado.id
                                    ? "Enviando..."
                                    : "Solicitar aprovação"}
                            </button>
                          </td>
                        </React.Fragment>
                      )}

                      <td className="text-nowrap">
                        {formatarData(chamado.dataAbertura)}
                      </td>
                      <td>{formatarData(chamado.dataFechamento)}</td>
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
