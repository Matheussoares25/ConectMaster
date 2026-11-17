import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api from "../../../Services/EndPoint";

const prioridadeLabel = { 1: "Baixa", 2: "Média", 3: "Alta", 4: "Crítica" };
const categoriasCompras = new Set([
  "compra",
  "cotacao",
  "fornecedor",
  "pedido",
  "outros",
]);

const normalizarCategoria = (categoria = "") =>
  String(categoria)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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

export default function MeusChamadosCompras() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarChamados = async () => {
      try {
        const response = await Api.CallEndpoint("ChamadosCompras/me", "GET");
        const lista = response?.chamados || response;

        if (!Array.isArray(lista)) {
          throw new Error("A resposta da API não contém uma lista de chamados.");
        }

        setChamados(
          lista.filter((chamado) =>
            categoriasCompras.has(normalizarCategoria(chamado.categoria)),
          ),
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: error.message || "Não foi possível carregar seus chamados.",
          background: "#141826",
          color: "#fff",
          confirmButtonColor: "#2f6fed",
        });
      } finally {
        setCarregando(false);
      }
    };

    carregarChamados();
  }, []);

  return (
    <div>
      <div className="compras-chamados__header">
        <h1>Meus chamados de Compras</h1>
        <p>Acompanhe as solicitações de Compras que você abriu.</p>
      </div>

      <div className="gu-card p-4">
        {carregando ? (
          <p className="gu-text-muted mb-0">Carregando chamados...</p>
        ) : chamados.length === 0 ? (
          <p className="gu-text-muted mb-0">
            Você ainda não abriu chamados de Compras.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table gu-table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Data de abertura</th>
                </tr>
              </thead>
              <tbody>
                {chamados.map((chamado) => (
                  <tr key={chamado.id}>
                    <td>{chamado.id}</td>
                    <td>{chamado.titulo}</td>
                    <td>{chamado.categoria}</td>
                    <td>
                      <span
                        className={`gu-badge gu-badge--prioridade-${chamado.prioridade}`}
                      >
                        {prioridadeLabel[chamado.prioridade] || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className={classeStatus(chamado.status)}>
                        {chamado.status}
                      </span>
                    </td>
                    <td className="text-nowrap">
                      {chamado.dataAbertura
                        ? new Date(chamado.dataAbertura).toLocaleString(
                            "pt-BR",
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
