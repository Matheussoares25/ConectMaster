import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api from "../../../../../Services/EndPoint";
import "../css/GerenciarUsuario.css";

const prioridadeLabel = { 1: "Baixa", 2: "Média", 3: "Alta", 4: "Crítica" };

const formatarData = (data) => {
  if (!data) return "—";

  const dataFormatada = new Date(data);
  if (Number.isNaN(dataFormatada.getTime())) return "—";

  return dataFormatada.toLocaleString("pt-BR");
};

export default function ChamadosComprasStandby() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarChamados = async () => {
      try {
        const response = await Api.CallEndpoint("ChamadosCompras", "GET");
        const lista = response?.chamados || response;

        if (!Array.isArray(lista)) {
          throw new Error("A resposta da API não contém uma lista de chamados.");
        }

        setChamados(lista.filter((chamado) => chamado.standby === true));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text:
            error.message ||
            "Não foi possível carregar os chamados de Compras em standby.",
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
    <div className="gerenciar-usuarios">
      <h2 className="h4 fw-bold mb-1 gu-text-primary">
        Chamados de Compras em standby
      </h2>
      <p className="gu-text-muted mb-4">
        Chamados enviados para standby e aguardando acompanhamento.
      </p>

      <div className="gu-card p-4">
        {carregando ? (
          <p className="gu-text-muted mb-0">Carregando chamados...</p>
        ) : chamados.length === 0 ? (
          <p className="gu-text-muted mb-0">
            Não há chamados de Compras em standby.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table gu-table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Solicitante</th>
                  <th>Setor</th>
                  <th>E-mail</th>
                  <th>Categoria</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Aprovado</th>
                  <th>Data de abertura</th>
                </tr>
              </thead>
              <tbody>
                {chamados.map((chamado) => (
                  <tr key={chamado.id}>
                    <td>{chamado.id}</td>
                    <td>{chamado.titulo || "—"}</td>
                    <td className="text-break">{chamado.descricao || "—"}</td>
                    <td>{chamado.usuario?.nome || "—"}</td>
                    <td>
                      {chamado.setor ||
                        chamado.usuario?.departamentoNome ||
                        "—"}
                    </td>
                    <td>{chamado.email || chamado.usuario?.email || "—"}</td>
                    <td>{chamado.categoria || "—"}</td>
                    <td>
                      {prioridadeLabel[chamado.prioridade] || "N/A"}
                    </td>
                    <td>{chamado.status || "—"}</td>
                    <td>
                      {chamado.aprovado ? (
                        <span className="gu-badge">Aprovado pela gestão</span>
                      ) : (
                        "Não"
                      )}
                    </td>
                    <td className="text-nowrap">
                      {formatarData(chamado.dataAbertura)}
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
