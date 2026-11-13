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

export default function HistoricoServicos() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [servicoEditando, setServicoEditando] = useState(null);

  useEffect(() => {
    carregarServicos();
  }, []);

  const handleStatusChange = async (id, status) => {
    console.log(servicoEditando, status);
    Swal.fire({
      icon: "question",
      title: "Alterar Status",
      text: `Tem certeza que deseja alterar o status de: ${servicoEditando.status} para: ${status}`,
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

      console.log(servicoEditando, status);
      if (status === "Concluído") {
        await Api.CallEndpoint(`Servicos/${id}/fechar`, "PUT", { status });
        await carregarServicos();
        Swal.fire({
          icon: "success",
          title: "Serviço concluído com sucesso!",
          background: "#141826",
          color: "#fff",
          confirmButtonColor: "#2f6fed",
        });
        setServicoEditando(null);
        return;
      }

      await Api.CallEndpoint(`Servicos/${id}/status`, "PATCH", {
        status: status,
      });
      await carregarServicos();
      Swal.fire({
        icon: "success",
        title: "Status alterado com sucesso!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      setServicoEditando(null);
    });
  };

  const carregarServicos = async () => {
    setCarregando(true);
    try {
      const response = await Api.CallEndpoint("Servicos", "GET");
      setServicos(response?.servicos || response || []);
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

  const ApagarServico = async (id) => {
    Swal.fire({
      icon: "question",
      title: "Apagar Serviço",
      text: "Tem certeza que deseja apagar este serviço?",
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

      await Api.CallEndpoint(`Servicos/${id}`, "DELETE");
      await carregarServicos();
      Swal.fire({
        icon: "success",
        title: "Serviço apagado com sucesso!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    });
  };

  const DetalhesServico = async (id) => {
  const response = await Api.CallEndpoint(`Servicos/${id}`, "GET");
  const s = response; // se a API devolver { data: {...} }, use response.data

  const esc = (x) =>
    String(x)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const v = (x) => (x === null || x === undefined || x === "" ? "—" : esc(x));
  const d = (x) => (x ? new Date(x).toLocaleString("pt-BR") : "—");
  const m = (x) =>
    x == null
      ? "—"
      : Number(x).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const linha = (label, valor) =>
    `<p style="margin:4px 0"><b>${label}:</b> ${valor}</p>`;

    Swal.fire({
      icon: "info",
      title: "Detalhes do Serviço",
      width: 700,
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#2f6fed",
      html: `
    <div style="text-align:left;max-height:60vh;overflow-y:auto">
      ${linha("ID", s.id)}
      ${linha("Título", v(s.titulo))}
      ${linha("E-mail", v(s.email))}
      ${linha("Setor", v(s.setor))}
      ${linha("Categoria", v(s.categoria))}
      ${linha("Prioridade", v(s.prioridade))}
      ${linha("Status", v(s.status))}
      ${linha("Descrição", v(s.descricao))}
      <hr>
      ${linha("Cliente", v(s.clienteNome))}
      ${linha("Documento", v(s.clienteDocumento))}
      ${linha("Telefone", v(s.clienteTelefone))}
      ${linha("Contato", v(s.clienteContato))}
      <hr>
      ${linha("Descrição da carga", v(s.descricaoCarga))}
      ${linha("Natureza", v(s.naturezaCarga))}
      ${linha("Peso bruto", v(s.pesoBruto))}
      ${linha("Volume", v(s.volume))}
      ${linha("Qtd. volumes", v(s.qtdVolumes))}
      ${linha("Valor da mercadoria", m(s.valorMercadoria))}
      <hr>
      ${linha("Endereço de coleta", v(s.enderecoColeta))}
      ${linha("Data de coleta", d(s.dataColeta))}
      ${linha("Endereço de entrega", v(s.enderecoEntrega))}
      ${linha("Data de entrega", d(s.dataEntrega))}
      <hr>
      ${linha("Placa", v(s.placaVeiculo))}
      ${linha("Tipo de veículo", v(s.tipoVeiculo))}
      ${linha("Motorista", v(s.motoristaNome))}
      ${linha("Tel. motorista", v(s.motoristaTelefone))}
      <hr>
      ${linha("NF-e", v(s.numeroNfe))}
      ${linha("CT-e", v(s.numeroCte))}
      ${linha("Valor do frete", m(s.valorFrete))}
      ${linha("Forma de pagamento", v(s.formaPagamento))}
      <hr>
      ${linha("Abertura", d(s.dataAbertura))}
      ${linha("Última alteração", d(s.dataAlteracao))}
      ${linha("Fechamento", d(s.dataFechamento))}
    </div>`,
    });
  };

  const statusDisponiveis = [
    ...new Set(servicos.map((s) => s.status).filter(Boolean)),
  ];

  const servicosFiltrados = servicos.filter((servico) => {
    const bateTexto =
      !filtroTexto ||
      servico.titulo?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      servico.categoria?.toLowerCase().includes(filtroTexto.toLowerCase());

    const bateStatus = !filtroStatus || servico.status === filtroStatus;
    const batePrioridade =
      !filtroPrioridade || String(servico.prioridade) === filtroPrioridade;

    return bateTexto && bateStatus && batePrioridade;
  });

  const total = servicos.length;
  const abertos = servicos.filter((s) => s.status === "Pendente").length;
  const emAndamento = servicos.filter(
    (s) => s.status === "Em andamento",
  ).length;
  const Finalizados = servicos.filter((s) => s.status === "Finalizado").length;

  const prioridadeLabel = { 1: "Baixa", 2: "Média", 3: "Alta", 4: "Crítica" };

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
      nome: "Finalizado",
      total: Finalizados,
    },
    {
      nome: "Total",
      total: total,
    },
  ];

  const optionstatus = ["Pendente", "Em andamento", "Finalizado", "Cancelado"];

  const classeStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "pendente":
        return "hc-badge hc-badge--info";
      case "em andamento":
        return "hc-badge hc-badge--warning";
      case "Finalizado":
        return "hc-badge hc-badge--success";
      case "Cancelado":
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
          Histórico de Serviços
        </h2>
        <p className="hc-text-muted mb-0">Consulte serviços em abertos</p>
      </div>

      {/* ===== CARDS DE MÉTRICAS ===== */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="hc-card p-3">
            <p className="hc-text-muted mb-1 hc-metric-label">
              Total de Serviços
            </p>
            <h3 className="hc-text-primary fw-bold mb-0">{total}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="hc-card p-3">
            <p className="hc-text-muted mb-1 hc-metric-label">
              Pendentes aprovacao
            </p>
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
            <p className="hc-text-muted mb-1 hc-metric-label">Finalizados</p>
            <h3
              className="fw-bold mb-0"
              style={{ color: "var(--color-success)" }}
            >
              {Finalizados}
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

              <Bar dataKey="total" fill="#59e546" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== LISTA DE SERVIÇOS ===== */}
      <div className="hc-card p-4">
        <h3 className="h6 fw-semibold mb-3 hc-text-primary">
          Serviços registrados
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
          <p className="hc-text-muted mb-0">Carregando serviços...</p>
        ) : servicosFiltrados.length === 0 ? (
          <p className="hc-text-muted mb-0">Nenhum serviço encontrado.</p>
        ) : (
          <div className="table-responsive">
            <table className="table hc-table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Usuário / email </th>
                  <th>Departamento</th>
                  <th>Categoria</th>
                  <th>Prioridade</th>
                  <th>Status</th>

                  <th className="text-end">Ações</th>
                  <th>Data de abertura</th>
                  <th>Data de conclusão</th>
                </tr>
              </thead>
              <tbody>
                {servicosFiltrados.map((servico) => {
                  const emEdicao = servicoEditando?.id === servico.id;

                  return (
                    <tr key={servico.id}>
                      <td>{servico.id}</td>
                      <td>{servico.titulo}</td>
                      <td>{servico.email}</td>
                      <td>{servico.setor}</td>
                      <td>{servico.categoria}</td>

                      <td>
                        <span className={classePrioridade(servico.prioridade)}>
                          {prioridadeLabel[servico.prioridade] || "N/A"}
                        </span>
                      </td>

                      {emEdicao ? (
                        <React.Fragment>
                          <td>
                            <select
                              className="form-select form-select-sm hc-input"
                              value={servico.status}
                              onChange={(e) =>
                                handleStatusChange(servico.id, e.target.value)
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
                              onClick={() => setServicoEditando(null)}
                            >
                              Cancelar
                            </button>
                          </td>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <td>
                            <span
                              className={classeStatus(servico.status)}
                              onClick={() => setServicoEditando(servico)}
                              style={{ cursor: "pointer" }}
                            >
                              {servico.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm hc-btn-icon"
                              title="Editar status"
                              onClick={() => setServicoEditando(servico)}
                            >
                              ✎
                            </button>
                            <button
                              className="btn btn-sm hc-btn-icon"
                              title="Apagar serviço"
                              onClick={() => ApagarServico(servico.id)}
                            >
                              🗑
                            </button>
                            <button
                              className="btn btn-sm hc-btn-icon"
                              title="Visualizar detalhes"
                              onClick={() => DetalhesServico(servico.id)}
                            >
                              🕒
                            </button>
                          </td>
                        </React.Fragment>
                      )}

                      <td className="text-nowrap">
                        {formatarData(servico.dataAbertura)}
                      </td>
                      <td>{formatarData(servico.dataFechamento)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="hc-text-muted mb-0 hc-footer-count">
          Exibindo {servicosFiltrados.length} de {servicos.length} serviço(s).
        </p>
      </div>
    </div>
  );
}
