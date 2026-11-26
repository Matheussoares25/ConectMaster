import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api, { swalBase } from "../../../../../Services/EndPoint";
import "../DpMoveis.css";

const formularioInicial = {
  departamentoId: "",
  aparelho: "",
  responsavel: "",
  contato: "",
  dataDoTermo: "",
};

export default function CadastroDpMoveis() {
  const [departamentos, setDepartamentos] = useState([]);
  const [carregandoDepartamentos, setCarregandoDepartamentos] = useState(true);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [termoPdf, setTermoPdf] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let mounted = true;
    const carregarDepartamentos = async () => {
      try {
        const resposta = await Api.CallEndpoint("Departamentos", "GET");
        const lista = resposta?.departamentos || resposta;
        if (!Array.isArray(lista)) {
          throw new Error("A resposta da API não contém uma lista válida de departamentos.");
        }
        if (mounted) setDepartamentos(lista);
      } catch (error) {
        Swal.fire({
          ...swalBase,
          icon: "error",
          title: "Erro ao carregar departamentos",
          text: error.message || "Não foi possível carregar os departamentos.",
        });
      } finally {
        if (mounted) setCarregandoDepartamentos(false);
      }
    };

    carregarDepartamentos();
    return () => { mounted = false; };
  }, []);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const registro = {
      departamentoId: Number(formulario.departamentoId),
      aparelho: formulario.aparelho.trim(),
      responsavel: formulario.responsavel.trim(),
      contato: formulario.contato.trim(),
      dataDoTermo: formulario.dataDoTermo
        ? `${formulario.dataDoTermo}T00:00:00Z`
        : "",
    };

    if (!registro.departamentoId || !registro.aparelho || !registro.responsavel || !formulario.dataDoTermo || !termoPdf) {
      Swal.fire({
        ...swalBase,
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Selecione um departamento, preencha os dados e anexe o termo em PDF.",
      });
      return;
    }

    const dados = new FormData();
    dados.append("departamentoId", String(registro.departamentoId));
    dados.append("aparelho", registro.aparelho);
    dados.append("responsavel", registro.responsavel);
    dados.append("contato", registro.contato);
    dados.append("dataDoTermo", registro.dataDoTermo);
    dados.append("termoPdf", termoPdf);

    setSalvando(true);
    try {
      await Api.CallEndpoint("DpMoveis", "POST", dados);
      setFormulario(formularioInicial);
      setTermoPdf(null);
      const campoArquivo = document.getElementById("dp-moveis-termo-pdf");
      if (campoArquivo) campoArquivo.value = "";
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
          <span className="dp-moveis-eyebrow">Tecnologia da Informação</span>
          <h1>Dp Móveis</h1>
          <p>Cadastre aparelhos e anexe os termos de responsabilidade.</p>
        </div>
      </header>

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
            <select className="dp-moveis-select" disabled={carregandoDepartamentos} name="departamentoId" onChange={handleChange} required value={formulario.departamentoId}>
              <option value="">{carregandoDepartamentos ? "Carregando departamentos..." : "Selecione um departamento"}</option>
              {departamentos.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>{departamento.nome}</option>
              ))}
            </select>
          </label>
          <label className="dp-moveis-field">
            <span>Aparelho</span>
            <input maxLength={150} name="aparelho" onChange={handleChange} placeholder="Ex.: Notebook Dell Latitude" required value={formulario.aparelho} />
          </label>
          <label className="dp-moveis-field">
            <span>Responsável</span>
            <input autoComplete="name" maxLength={100} name="responsavel" onChange={handleChange} placeholder="Nome de quem recebeu o aparelho" required value={formulario.responsavel} />
          </label>
          <label className="dp-moveis-field">
            <span>Contato</span>
            <input autoComplete="tel" maxLength={150} name="contato" onChange={handleChange} placeholder="Telefone, ramal ou e-mail" value={formulario.contato} />
          </label>
          <label className="dp-moveis-field">
            <span>Data do termo</span>
            <input name="dataDoTermo" onChange={handleChange} required type="date" value={formulario.dataDoTermo} />
          </label>
          <label className="dp-moveis-field dp-moveis-file-field">
            <span>Termo assinado (PDF, até 10 MB)</span>
            <input accept="application/pdf,.pdf" id="dp-moveis-termo-pdf" onChange={handlePdfChange} required type="file" />
          </label>
        </div>

        <div className="dp-moveis-form-actions">
          <button className="dp-moveis-button" disabled={salvando || carregandoDepartamentos || departamentos.length === 0} type="submit">
            {salvando ? "Salvando..." : "Cadastrar aparelho"}
          </button>
        </div>
      </form>
    </section>
  );
}
