import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api from "../../../Services/EndPoint";


const prioridadeLabel = { 1: "Baixa", 2: "Média", 3: "Alta", 4: "Crítica" };

const swalTema = {
  background: "#141826",
  color: "#fff",
  confirmButtonColor: "#2f6fed",
};

const formatarData = (data) => {
  if (!data) return "—";

  const dataFormatada = new Date(data);
  if (Number.isNaN(dataFormatada.getTime())) return "—";

  return dataFormatada.toLocaleString("pt-BR");
};

export default function ListaAcesso() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aprovandoId, setAprovandoId] = useState(null);
  const [baixandoArquivoId, setBaixandoArquivoId] = useState(null);
  const [user, setUser] = useState({});
  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    setUser(storedUser || {});
  }, []);
  useEffect(() => {
    let ativo = true;

    const carregarChamados = async () => {
      try {
        const response = await Api.CallEndpoint(
          "Acessos",
          "GET",
        );
        const lista = response?.chamados || response;

        if (!Array.isArray(lista)) {
          throw new Error(
            "A resposta da API não contém uma lista de chamados.",
          );
        }

        if (ativo) {
          setChamados(lista.filter((chamado) => chamado.standby === true));
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text:
            error.message ||
            "Não foi possível carregar os chamados de Compras em standby.",
          ...swalTema,
        });
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregarChamados();

    return () => {
      ativo = false;
    };
  }, []);


  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>

      <div className="flex-grow-1 p-5 panel-content">
        <div className="flex-grow-1 p-5 panel-content">
          <h2 className="h4 fw-bold mb-1 gu-text-primary">
            Acessos Portaria Formulario
          </h2>
          <p className="gu-text-muted mb-4">
            Formulário de acessos pendentes de aprovação pela portaria.
          </p>

          <div className="gu-card p-4">
            {carregando ? (
              <p className="gu-text-muted mb-0">Carregando chamados...</p>
            ) : chamados.length === 0 ? (
              <p className="gu-text-muted mb-0">
                Nenhum formulario de acesso pendente de aprovação.
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
                      <th>Cotações</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chamados.map((chamado) => (
                      <tr key={chamado.id}>
                        <td>{chamado.id}</td>
                        <td>{chamado.titulo || "—"}</td>
                        <td className="text-break">
                          {chamado.descricao || "—"}
                        </td>
                        <td>{chamado.usuario?.nome || "—"}</td>
                        <td>
                          {chamado.setor ||
                            chamado.usuario?.departamentoNome ||
                            "—"}
                        </td>
                        <td>
                          {chamado.email || chamado.usuario?.email || "—"}
                        </td>
                        <td>{chamado.categoria || "—"}</td>
                        <td>{prioridadeLabel[chamado.prioridade] || "N/A"}</td>
                        <td>{chamado.status || "—"}</td>
                        <td>
                          {chamado.aprovado ? (
                            <span className="gu-badge">
                              Aprovado pela gestão
                            </span>
                          ) : (
                            "Não"
                          )}
                        </td>
                        <td className="text-nowrap">
                          {formatarData(chamado.dataAbertura)}
                        </td>
                        <td>
                          {(chamado.arquivos || chamado.Arquivos || [])
                            .length === 0 ? (
                            "—"
                          ) : (
                            <div className="d-flex flex-column align-items-start gap-1">
                              {(chamado.arquivos || chamado.Arquivos || []).map(
                                (arquivo) => {
                                  const arquivoId = arquivo.id ?? arquivo.Id;
                                  const nomeOriginal =
                                    arquivo.nomeOriginal ||
                                    arquivo.NomeOriginal ||
                                    "Baixar cotação";

                                  return (
                                    <button
                                      key={arquivoId}
                                      type="button"
                                      className="btn btn-outline-primary btn-sm"
                                    >
                                      {baixandoArquivoId === arquivoId
                                        ? "Baixando..."
                                        : `Baixar ${nomeOriginal}`}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-nowrap">
                          {chamado.aprovado ? (
                            "—"
                          ) : (
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                            >
                              Aprovar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
