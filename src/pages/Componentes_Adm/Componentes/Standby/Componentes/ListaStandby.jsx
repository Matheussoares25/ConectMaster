import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api from "../../../../../Services/EndPoint";
import "../../../css/ChamadosStand.css";

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
  const [chamadosAprovados, setChamadosAprovados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aprovandoId, setAprovandoId] = useState(null);
  const [manifestandoId, setManifestandoId] = useState(null);
  const [contestandoId, setContestandoId] = useState(null);
  const [baixandoArquivoId, setBaixandoArquivoId] = useState(null);

  useEffect(() => {
    let ativo = true;

    const carregarChamados = async () => {
      try {
        const [responseStandby, responseAprovados] = await Promise.all([
          Api.CallEndpoint("ChamadosCompras/Standby", "GET"),
          Api.CallEndpoint("ChamadosCompras/Aprovados", "GET"),
        ]);
        const listaStandby = responseStandby?.chamados || responseStandby;
        const listaAprovados = responseAprovados?.chamados || responseAprovados;

        if (!Array.isArray(listaStandby) || !Array.isArray(listaAprovados)) {
          throw new Error("A resposta da API não contém listas de chamados válidas.");
        }

        if (ativo) {
          setChamados(listaStandby.filter((chamado) => chamado.standby === true));
          setChamadosAprovados(
            listaAprovados.filter(
              (chamado) => chamado.standby === false && chamado.aprovado === true,
            ),
          );
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text:
            error.message ||
            "Não foi possível carregar os chamados de Compras.",
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
      await Api.CallEndpoint(
        `ChamadosCompras/${chamado.id}/standby`,
        "PATCH",
        "aprovar",
      );

      const chamadoAprovado = {
        ...chamado,
        aprovado: true,
        standby: false,
        dataAprovacao: new Date().toISOString(),
      };
      setChamados((atual) => atual.filter((item) => item.id !== chamado.id));
      setChamadosAprovados((atual) => [chamadoAprovado, ...atual]);

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

  const contestarChamado = async (chamado) => {
    const resultado = await Swal.fire({
      title: `Contestação do chamado #${chamado.id}`,
      input: "textarea",
      inputValue: chamado.contestacao || "",
      inputPlaceholder: "Escreva a contestação...",
      inputAttributes: { maxlength: "2000", rows: "7" },
      inputValidator: (valor) =>
        valor?.trim() ? undefined : "Escreva uma contestação antes de salvar.",
      showCancelButton: true,
      confirmButtonText: "Salvar contestação",
      cancelButtonText: "Cancelar",
      ...swalTema,
    });

    if (!resultado.isConfirmed) return;

    const contestacao = resultado.value.trim();
    setContestandoId(chamado.id);
    try {
      await Api.CallEndpoint(
        `ChamadosCompras/${chamado.id}/contestacao`,
        "POST",
        { contestacao },
      );
      setChamados((atual) =>
        atual.map((item) =>
          item.id === chamado.id ? { ...item, contestacao } : item,
        ),
      );
      await Swal.fire({
        icon: "success",
        title: "Contestação salva",
        timer: 1500,
        showConfirmButton: false,
        ...swalTema,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível salvar a contestação.",
        ...swalTema,
      });
    } finally {
      setContestandoId(null);
    }
  };

  const manifestarChamado = async (chamado) => {
    const resultado = await Swal.fire({
      title: `Manifestação do chamado #${chamado.id}`,
      input: "textarea",
      inputValue: chamado.manifestacao || "",
      inputPlaceholder: "Escreva a manifestação...",
      inputAttributes: { maxlength: "2000", rows: "7" },
      inputValidator: (valor) =>
        valor?.trim() ? undefined : "Escreva uma manifestação antes de salvar.",
      showCancelButton: true,
      confirmButtonText: "Salvar manifestação",
      cancelButtonText: "Cancelar",
      ...swalTema,
    });

    if (!resultado.isConfirmed) return;

    const manifestacao = resultado.value.trim();
    setManifestandoId(chamado.id);
    try {
      await Api.CallEndpoint(
        `ChamadosCompras/${chamado.id}/manifestacao`,
        "POST",
        { manifestacao },
      );
      setChamados((atual) =>
        atual.map((item) =>
          item.id === chamado.id ? { ...item, manifestacao } : item,
        ),
      );
      await Swal.fire({
        icon: "success",
        title: "Manifestação salva",
        timer: 1500,
        showConfirmButton: false,
        ...swalTema,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível salvar a manifestação.",
        ...swalTema,
      });
    } finally {
      setManifestandoId(null);
    }
  };

  return (
    <div className="compras-standby panel-content">
      <h2 className="h4 fw-bold mb-1 gu-text-primary">
        Acompanhamento de chamados de Compras
      </h2>
      <p className="gu-text-muted mb-4">
        Gerencie chamados aguardando aprovação e acompanhe os já aprovados.
      </p>

      <section className="mb-4" aria-labelledby="standby-heading">
        <h3 id="standby-heading" className="h5 fw-bold gu-text-primary">
          Chamados em standby
        </h3>
        <p className="gu-text-muted mb-3">
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
                <table className="table gu-table standby-tickets-table align-middle mb-0">
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
                    <th>Manifestação</th>
                    <th>Contestação</th>
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
                      <td>{chamado.email || chamado.usuario?.email || "—"}</td>
                      <td>{chamado.categoria || "—"}</td>
                      <td>{prioridadeLabel[chamado.prioridade] || "N/A"}</td>
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
                      <td>
                        {(chamado.arquivos || chamado.Arquivos || []).length ===
                        0 ? (
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
                                    onClick={() => baixarCotacao(chamado, arquivo)}
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
                      <td className="manifestation-cell">
                        {chamado.manifestacao || "Ainda não manifestado"}
                      </td>
                      <td className="manifestation-cell">
                        {chamado.contestacao || "Ainda não contestado"}
                      </td>
                      <td>
                        <div className="standby-actions">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => manifestarChamado(chamado)}
                              disabled={manifestandoId === chamado.id}
                            >
                              {manifestandoId === chamado.id
                                ? "Salvando..."
                                : chamado.manifestacao
                                  ? "Editar manifestação"
                                  : "Manifestar"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => contestarChamado(chamado)}
                              disabled={contestandoId === chamado.id}
                            >
                              {contestandoId === chamado.id
                                ? "Salvando..."
                                : chamado.contestacao
                                  ? "Editar contestação"
                                  : "Contestar"}
                            </button>
                            {!chamado.aprovado && (
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
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="approved-heading">
        <h3 id="approved-heading" className="h5 fw-bold gu-text-primary">
          Chamados aprovados
        </h3>
        <p className="gu-text-muted mb-3">
          Consulta de chamados aprovados e já fora do standby.
        </p>
        <div className="gu-card p-4">
          {carregando ? (
            <p className="gu-text-muted mb-0">Carregando chamados...</p>
          ) : chamadosAprovados.length === 0 ? (
            <p className="gu-text-muted mb-0">
              Não há chamados aprovados para exibir.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table gu-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Solicitante</th>
                    <th>Setor</th>
                    <th>Data de aprovação</th>
                    <th>Manifestação</th>
                    <th>Contestação</th>
                  </tr>
                </thead>
                <tbody>
                  {chamadosAprovados.map((chamado) => (
                    <tr key={chamado.id}>
                      <td>{chamado.id}</td>
                      <td>{chamado.titulo || "—"}</td>
                      <td>{chamado.usuario?.nome || "—"}</td>
                      <td>
                        {chamado.setor ||
                          chamado.usuario?.departamentoNome ||
                          "—"}
                      </td>
                      <td className="text-nowrap">
                        {formatarData(chamado.dataAprovacao)}
                      </td>
                      <td className="manifestation-cell">
                        {chamado.manifestacao || "Ainda não manifestado"}
                      </td>
                      <td className="manifestation-cell">
                        {chamado.contestacao || "Ainda não contestado"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
