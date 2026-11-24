import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Api, { swalBase } from "../../../../../Services/EndPoint";
import "../DpMoveis.css";

const formularioInicial = {
  departamento: "",
  aparelho: "",
  responsavel: "",
  dataDoTermo: "",
};

function formatarData(data) {
  if (!data) return "—";

  const [ano, mes, dia] = String(data).split("T")[0].split("-");
  if (!ano || !mes || !dia) return "—";
  return `${dia}/${mes}/${ano}`;
}

export default function GerenciarDpMoveis({ secao }) {
  const [registros, setRegistros] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [filtro, setFiltro] = useState("");
  const [termoPdf, setTermoPdf] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [baixandoId, setBaixandoId] = useState(null);

  const carregarRegistros = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await Api.CallEndpoint("DpMoveis", "GET");
      const lista = resposta?.dpMoveis || resposta?.registros || resposta;
      if (!Array.isArray(lista)) {
        throw new Error("A resposta da API não contém uma lista de registros.");
      }
      setRegistros(lista);
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro ao carregar",
        text: error.message || "Não foi possível carregar os registros de Dp Móveis.",
      });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const registrosFiltrados = useMemo(() => {
    const termo = filtro.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return registros;

    return registros.filter((registro) =>
      [registro.departamento, registro.aparelho, registro.responsavel, registro.nomeArquivoTermo]
        .some((valor) => valor?.toLocaleLowerCase("pt-BR").includes(termo)),
    );
  }, [filtro, registros]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const handlePdfChange = (event) => {
    const arquivo = event.target.files?.[0] || null;
    if (!arquivo) {
      setTermoPdf(null);
      return;
    }

    if (!arquivo.name.toLowerCase().endsWith(".pdf")) {
      event.target.value = "";
      setTermoPdf(null);
      Swal.fire({
        ...swalBase,
        icon: "warning",
        title: "Arquivo inválido",
        text: "Selecione um arquivo PDF.",
      });
      return;
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      event.target.value = "";
      setTermoPdf(null);
      Swal.fire({
        ...swalBase,
        icon: "warning",
        title: "Arquivo muito grande",
        text: "O PDF deve ter no máximo 10 MB.",
      });
      return;
    }

    setTermoPdf(arquivo);
  };

  const baixarTermo = async (registro) => {
    setBaixandoId(registro.id);
    try {
      const arquivo = await Api.CallEndpoint(
        `DpMoveis/${registro.id}/termo`,
        "GET",
        null,
        null,
        "blob",
      );
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement("a");
      link.href = url;
      link.download = registro.nomeArquivoTermo || `termo-dpmoveis-${registro.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro ao baixar o termo",
        text: error.message || "Não foi possível baixar o arquivo.",
      });
    } finally {
      setBaixandoId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const registro = {
      departamento: formulario.departamento.trim(),
      aparelho: formulario.aparelho.trim(),
      responsavel: formulario.responsavel.trim(),
      dataDoTermo: formulario.dataDoTermo
        ? `${formulario.dataDoTermo}T00:00:00Z`
        : "",
    };

    if (!registro.departamento || !registro.aparelho || !registro.responsavel || !formulario.dataDoTermo || !termoPdf) {
      Swal.fire({
        ...swalBase,
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha os dados e anexe o termo em PDF.",
      });
      return;
    }

    const dados = new FormData();
    dados.append("departamento", registro.departamento);
    dados.append("aparelho", registro.aparelho);
    dados.append("responsavel", registro.responsavel);
    dados.append("dataDoTermo", registro.dataDoTermo);
    dados.append("termoPdf", termoPdf);

    setSalvando(true);
    try {
      await Api.CallEndpoint("DpMoveis", "POST", dados);
      setFormulario(formularioInicial);
      setTermoPdf(null);
      const campoArquivo = document.getElementById("dp-moveis-termo-pdf");
      if (campoArquivo) campoArquivo.value = "";
      await carregarRegistros();
      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Registro cadastrado",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro ao cadastrar",
        text: error.message || "Não foi possível cadastrar o Dp Móveis.",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="dp-moveis-page">
      <header className="dp-moveis-heading">
        <div>
          <span className="dp-moveis-eyebrow">Dispositiveis Moveis</span>
          <h1>Dp Móveis</h1>
          <p>Cadastre aparelhos com seus termos em PDF e consulte os registros por departamento.</p>
        </div>
        <div className="dp-moveis-total" aria-live="polite">
          <strong>{registros.length}</strong>
          <span>{registros.length === 1 ? "registro" : "registros"}</span>
        </div>
      </header>

      {secao === "cadastro" && (
      <form className="dp-moveis-card dp-moveis-form" onSubmit={handleSubmit}>
        <div className="dp-moveis-card-heading">
          <div>
            <h2>Novo cadastro</h2>
            <p>Informe os dados do aparelho e do termo.</p>
          </div>
        </div>

        <div className="dp-moveis-form-grid">
          <label className="dp-moveis-field">
            <span>Departamento</span>
            <input
              autoComplete="organization"
              maxLength={100}
              name="departamento"
              onChange={handleChange}
              placeholder="Ex.: Recursos Humanos"
              required
              value={formulario.departamento}
            />
          </label>

          <label className="dp-moveis-field">
            <span>Aparelho</span>
            <input
              maxLength={150}
              name="aparelho"
              onChange={handleChange}
              placeholder="Ex.: Notebook Dell Latitude"
              required
              value={formulario.aparelho}
            />
          </label>

          <label className="dp-moveis-field">
            <span>Responsável</span>
            <input
              autoComplete="name"
              maxLength={100}
              name="responsavel"
              onChange={handleChange}
              placeholder="Nome de quem recebeu o aparelho"
              required
              value={formulario.responsavel}
            />
          </label>

          <label className="dp-moveis-field">
            <span>Data do termo</span>
            <input
              name="dataDoTermo"
              onChange={handleChange}
              required
              type="date"
              value={formulario.dataDoTermo}
            />
          </label>

          <label className="dp-moveis-field dp-moveis-file-field">
            <span>Termo assinado (PDF, até 10 MB)</span>
            <input
              accept="application/pdf,.pdf"
              id="dp-moveis-termo-pdf"
              onChange={handlePdfChange}
              required
              type="file"
            />
          </label>
        </div>

        <div className="dp-moveis-form-actions">
          <button className="dp-moveis-button" disabled={salvando} type="submit">
            {salvando ? "Salvando..." : "Cadastrar aparelho"}
          </button>
        </div>
      </form>
      )}

      {secao === "lista" && (
      <section className="dp-moveis-card" aria-labelledby="dp-moveis-list-title">
        <div className="dp-moveis-list-heading">
          <div>
            <h2 id="dp-moveis-list-title">Aparelhos cadastrados</h2>
            <p>Consulte os aparelhos e os termos de responsabilidade.</p>
          </div>
          <label className="dp-moveis-search">
            <span className="visually-hidden">Buscar aparelhos</span>
            <input
              onChange={(event) => setFiltro(event.target.value)}
              placeholder="Buscar por departamento, aparelho ou responsável"
              type="search"
              value={filtro}
            />
          </label>
        </div>

        {carregando ? (
          <p className="dp-moveis-message" role="status">Carregando registros...</p>
        ) : registrosFiltrados.length === 0 ? (
          <p className="dp-moveis-message">
            {filtro ? "Nenhum registro corresponde à busca." : "Ainda não há aparelhos cadastrados."}
          </p>
        ) : (
          <div className="table-responsive dp-moveis-table-wrap">
            <table className="table align-middle dp-moveis-table">
              <thead>
                <tr>
                  <th scope="col">Departamento</th>
                  <th scope="col">Aparelho</th>
                  <th scope="col">Responsável</th>
                  <th scope="col">Data do termo</th>
                  <th scope="col">Arquivo</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((registro) => (
                  <tr key={registro.id}>
                    <td>{registro.departamento || "—"}</td>
                    <td>{registro.aparelho || "—"}</td>
                    <td>{registro.responsavel || "—"}</td>
                    <td>{formatarData(registro.dataDoTermo)}</td>
                    <td>
                      {registro.possuiTermoPdf || registro.nomeArquivoTermo ? (
                        <button
                          className="dp-moveis-download"
                          disabled={baixandoId === registro.id}
                          onClick={() => baixarTermo(registro)}
                          type="button"
                        >
                          {baixandoId === registro.id ? "Baixando..." : "Baixar PDF"}
                        </button>
                      ) : (
                        <span className="dp-moveis-no-file">Sem PDF</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}
    </section>
  );
}
