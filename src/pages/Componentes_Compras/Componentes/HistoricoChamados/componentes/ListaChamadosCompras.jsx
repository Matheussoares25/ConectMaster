import React, { useEffect, useRef, useState } from "react";
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

const escaparHtml = (valor) =>
  String(valor ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

export default function ListaChamadosCompras() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [chamadoEditando, setChamadoEditando] = useState(null);
  const [chamadoSelecionadoUpload, setChamadoSelecionadoUpload] =
    useState(null);
  const [chamadoEnviandoAnexo, setChamadoEnviandoAnexo] = useState(null);
  const [graficoAberto, setGraficoAberto] = useState(null);
  const [chamadoSolicitandoAprovacao, setChamadoSolicitandoAprovacao] =
    useState(null);
  const arquivoInputRef = useRef(null);

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
        "standby"
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

  const enviarAnexo = async (event) => {
    const arquivo = event.target.files?.[0];
    const chamadoId = chamadoSelecionadoUpload;
    event.target.value = "";
    setChamadoSelecionadoUpload(null);

    if (!arquivo || !chamadoId) return;

    if (!/\.(xlsx|xls)$/i.test(arquivo.name)) {
      Swal.fire({
        icon: "error",
        title: "Arquivo inválido",
        text: "Somente arquivos com extensão .xls ou .xlsx são permitidos.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      return;
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Arquivo muito grande",
        text: "O arquivo não pode exceder 10 MB.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      return;
    }

    const dados = new FormData();
    dados.append("arquivo", arquivo);

    setChamadoEnviandoAnexo(chamadoId);
    try {
      const resultado = await Api.CallEndpoint(
        `ChamadosCompras/${chamadoId}/upload`,
        "POST",
        dados,
      );
      Swal.fire({
        icon: "success",
        title: "Anexo enviado",
        text: resultado?.nomeOriginal || arquivo.name,
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao anexar arquivo",
        text: error?.message || "Não foi possível enviar o arquivo.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } finally {
      setChamadoEnviandoAnexo(null);
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

  const abrirDetalhes = (chamado) => {
    const texto = (valor) => escaparHtml(valor || "—");

    const campo = (rotulo, conteudoHtml, classeExtra = "") => `
      <div class="hc-details-item ${classeExtra}">
        <span class="hc-details-label">${escaparHtml(rotulo)}</span>
        <span>${conteudoHtml}</span>
      </div>`;

    const html = `
      <div class="hc-details-grid">
        ${campo("Descrição completa", texto(chamado.descricao), "hc-details-item--full")}
        ${campo("Solicitante", texto(chamado.usuario?.nome))}
        ${campo("E-mail", texto(chamado.email || chamado.usuario?.email))}
        ${campo("Departamento", texto(chamado.usuario?.departamentoNome || chamado.setor))}
        ${campo("Categoria", texto(chamado.categoria))}
        ${campo(
          "Prioridade",
          `<span class="${classePrioridade(chamado.prioridade)}">${escaparHtml(
            prioridadeLabel[chamado.prioridade] || "N/A",
          )}</span>`,
        )}
        ${campo(
          "Status",
          `<span class="${classeStatus(chamado.status)}">${texto(chamado.status)}</span>`,
        )}
        ${campo("Aprovado", escaparHtml(chamado.aprovado ? "Sim (gestão)" : "Não"))}
        ${campo("Standby", escaparHtml(chamado.standby ? "Sim" : "Não"))}
        ${campo("Data de abertura", escaparHtml(formatarData(chamado.dataAbertura)))}
        ${campo("Data de aprovação", escaparHtml(formatarData(chamado.dataAprovacao)))}
        ${campo("Data de conclusão", escaparHtml(formatarData(chamado.dataFechamento)))}
      </div>`;

    Swal.fire({
      title: `Chamado #${escaparHtml(chamado.id)}`,
      html,
      width: 720,
      confirmButtonText: "Fechar",
      confirmButtonColor: "#2f6fed",
      background: "#141826",
      color: "#fff",
      customClass: {
        htmlContainer: "hc-swal-detalhes",
      },
    });
  };

  return (
    <>
      <div className="hc-wrapper hc-compras-history">
        <div className="hc-page-header mb-4">
          <div>
            <span className="hc-page-eyebrow">Painel de compras</span>
            <h2 className="h3 fw-bold mb-1 hc-text-primary">
              Histórico de Chamados de Compras
            </h2>
            <p className="hc-text-muted mb-0">
              Acompanhe solicitações, prioridades e andamento dos chamados.
            </p>
          </div>
          <span className="hc-live-indicator">
            <span aria-hidden="true" />
            Visão geral
          </span>
        </div>

        {/* ===== CARDS DE MÉTRICAS ===== */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="hc-card hc-metric-card hc-metric-card--total p-3">
              <p className="hc-text-muted mb-2 hc-metric-label">
                Total de chamados
              </p>
              <h3 className="hc-text-primary fw-bold mb-0">{total}</h3>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="hc-card hc-metric-card hc-metric-card--open p-3">
              <p className="hc-text-muted mb-2 hc-metric-label">Abertos</p>
              <h3
                className="fw-bold mb-0"
                style={{ color: "var(--color-primary)" }}
              >
                {abertos}
              </h3>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="hc-card hc-metric-card hc-metric-card--progress p-3">
              <p className="hc-text-muted mb-2 hc-metric-label">Em andamento</p>
              <h3
                className="fw-bold mb-0"
                style={{ color: "var(--color-warning)" }}
              >
                {emAndamento}
              </h3>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="hc-card hc-metric-card hc-metric-card--done p-3">
              <p className="hc-text-muted mb-2 hc-metric-label">Concluídos</p>
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
        <div className="hc-card hc-chart-section p-4 mb-4">
          <div className="hc-chart-header">
            <div>
              <span className="hc-section-eyebrow">Indicadores</span>
              <h3 className="h5 fw-semibold mb-0 hc-text-primary">
                Chamados por status
              </h3>
            </div>
            <button
              type="button"
              className="hc-chart-toggle"
              aria-expanded={Boolean(graficoAberto)}
              onClick={() => setGraficoAberto(!graficoAberto)}
            >
              {graficoAberto ? "Recolher gráfico" : "Expandir gráfico"}
              <span aria-hidden="true">{graficoAberto ? "−" : "+"}</span>
            </button>
          </div>

          {graficoAberto && (
            <div className="hc-chart-content mt-3" id="hc-status-chart">
              <div className="hc-chart-frame p-3">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosStatus}>
                    <CartesianGrid
                      stroke="var(--border-card)"
                      strokeDasharray="4 4"
                    />
                    <XAxis dataKey="nome" tick={{ fill: "var(--text-muted)" }} />
                    <YAxis tick={{ fill: "var(--text-muted)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border-card)",
                        borderRadius: "10px",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Bar dataKey="total" fill="#46abe5" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* ===== LISTA DE CHAMADOS ===== */}
        <div className="hc-card hc-list-section p-4">
          <input
            ref={arquivoInputRef}
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="d-none"
            onChange={enviarAnexo}
          />
          <div className="hc-list-header">
            <div>
              <span className="hc-section-eyebrow">Gerenciamento</span>
              <h3 className="h5 fw-semibold mb-1 hc-text-primary">
                Chamados registrados
              </h3>
              <p className="hc-text-muted mb-0">
                Pesquise e filtre os chamados para encontrar uma solicitação.
              </p>
            </div>
            <span className="hc-result-count">
              {chamadosFiltrados.length} <span>/ {chamados.length}</span>
            </span>
          </div>

          <div className="row g-2 mb-3 hc-filters">
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
            <p className="hc-text-muted mb-0 hc-empty-state">
              Carregando chamados...
            </p>
          ) : chamadosFiltrados.length === 0 ? (
            <p className="hc-text-muted mb-0 hc-empty-state">
              Nenhum chamado encontrado.
            </p>
          ) : (
            <div className="table-responsive hc-table-viewport">
              <table className="table hc-table align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
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
                    <th>Manifestação</th>
                    <th>Contestação</th>
                    <th>Data de abertura</th>
                    <th>Data de conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {chamadosFiltrados.map((chamado) => {
                    const emEdicao = chamadoEditando?.id === chamado.id;

                    return (
                      <tr key={chamado.id}>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm hc-btn-icon"
                            title="Expandir detalhes"
                            onClick={() => abrirDetalhes(chamado)}
                          >
                            ⤢
                          </button>
                        </td>
                        <td>{chamado.id}</td>
                        <td>{chamado.titulo}</td>
                        <td className="text-break">
                          {chamado.descricao || "—"}
                        </td>
                        <td>{chamado.usuario?.nome || "—"}</td>
                        <td>
                          {chamado.usuario?.departamentoNome ||
                            chamado.setor ||
                            "—"}
                        </td>
                        <td>
                          {chamado.email || chamado.usuario?.email || "—"}
                        </td>
                        <td>{chamado.categoria}</td>

                        <td>
                          <span
                            className={classePrioridade(chamado.prioridade)}
                          >
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
                                  handleStatusChange(
                                    chamado.id,
                                    e.target.value,
                                  )
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
                                      : chamadoSolicitandoAprovacao ===
                                          chamado.id
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
                                className="btn btn-sm btn-outline-info ms-2"
                                disabled={chamadoEnviandoAnexo === chamado.id}
                                onClick={() => {
                                  setChamadoSelecionadoUpload(chamado.id);
                                  arquivoInputRef.current?.click();
                                }}
                              >
                                {chamadoEnviandoAnexo === chamado.id
                                  ? "Enviando..."
                                  : "Anexar XLS"}
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
                                    : chamadoSolicitandoAprovacao ===
                                        chamado.id
                                      ? "Enviando..."
                                      : "Solicitar aprovação"}
                              </button>
                            </td>
                          </React.Fragment>
                        )}

                        <td className="hc-text-cell">
                          {chamado.manifestacao || "—"}
                        </td>
                        <td className="hc-text-cell">
                          {chamado.contestacao || "—"}
                        </td>
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
            Exibindo {chamadosFiltrados.length} de {chamados.length}{" "}
            chamado(s).
          </p>
        </div>
      </div>
    </>
  );
}