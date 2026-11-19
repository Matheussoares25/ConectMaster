import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api from "../../../../../Services/EndPoint";


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

export default function ChamadosComprasStandby() {
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
          "ChamadosCompras/Standby",
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

  const aprovarChamado = async (chamado) => {
    const confirmacao = await Swal.fire({
      icon: "question",
      title: "Aprovar chamado?",
      text: `Deseja aprovar o chamado #${chamado.id}${
        chamado.titulo ? ` - ${chamado.titulo}` : ""
      }?`,
      showCancelButton: true,
      confirmButtonText: "Aprovar",
      cancelButtonText: "Cancelar",
      ...swalTema,
    });

    if (!confirmacao.isConfirmed) return;

    setAprovandoId(chamado.id);

    try {
      // Ajuste o endpoint/método conforme a sua API
      await Api.CallEndpoint(
        `ChamadosCompras/${chamado.id}/standby`,
        "PATCH",
        "aprovar",
      );

      setChamados((atual) =>
        atual.map((item) =>
          item.id === chamado.id ? { ...item, aprovado: true } : item,
        ),
      );

      Swal.fire({
        icon: "success",
        title: "Chamado aprovado",
        timer: 1500,
        showConfirmButton: false,
        ...swalTema,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível aprovar o chamado.",
        ...swalTema,
      });
    } finally {
      setAprovandoId(null);
    }
  };

  const baixarCotacao = async (chamado, arquivo) => {
    const arquivoId = arquivo.id ?? arquivo.Id;
    const nomeOriginal =
      arquivo.nomeOriginal || arquivo.NomeOriginal || "cotacao.xls";
    const rotaDownload =
      arquivo.rotaDownload ||
      arquivo.RotaDownload ||
      `/api/ChamadosCompras/${chamado.id}/arquivos/${arquivoId}`;
    const endpoint = rotaDownload.replace(/^\/?api\//i, "");

    setBaixandoArquivoId(arquivoId);
    try {
      const blob = await Api.CallEndpoint(endpoint, "GET", null, null, "blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeOriginal;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao baixar cotação",
        text: error.message || "Não foi possível baixar o arquivo.",
        ...swalTema,
      });
    } finally {
      setBaixandoArquivoId(null);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>

      <div className="flex-grow-1 p-5 panel-content">
        <div className="flex-grow-1 p-5 panel-content">
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
                                      onClick={() =>
                                        baixarCotacao(chamado, arquivo)
                                      }
                                      disabled={baixandoArquivoId === arquivoId}
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
                              onClick={() => aprovarChamado(chamado)}
                              disabled={aprovandoId === chamado.id}
                            >
                              {aprovandoId === chamado.id
                                ? "Aprovando..."
                                : "Aprovar"}
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
