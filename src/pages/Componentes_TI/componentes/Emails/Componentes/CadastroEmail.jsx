import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api, { swalBase } from "../../../../../Services/EndPoint";
import "../Emails.css";

export default function CadastroEmail() {
  const [departamentos, setDepartamentos] = useState([]);
  const [formulario, setFormulario] = useState({ email: "", responsavel: "", departamentoid: "" });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let mounted = true;
    const carregarDepartamentos = async () => {
      try {
        const resposta = await Api.CallEndpoint("Departamentos", "GET");
        const lista = resposta?.departamentos || resposta;
        if (!Array.isArray(lista)) throw new Error("A resposta da API não contém uma lista válida de departamentos.");
        if (mounted) setDepartamentos(lista);
      } catch (error) {
        Swal.fire({ ...swalBase, icon: "error", title: "Erro ao carregar departamentos", text: error.message || "Não foi possível carregar os departamentos." });
      } finally {
        if (mounted) setCarregando(false);
      }
    };
    carregarDepartamentos();
    return () => { mounted = false; };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dados = {
      email: formulario.email.trim(),
      responsavel: formulario.responsavel.trim(),
      departamentoid: Number(formulario.departamentoid),
    };
    if (!dados.email || !dados.responsavel || !dados.departamentoid) {
      Swal.fire({ ...swalBase, icon: "warning", title: "Campos obrigatórios", text: "Informe o e-mail, o responsável e o departamento." });
      return;
    }

    setSalvando(true);
    try {
      await Api.CallEndpoint("Emails", "POST", dados);
      setFormulario({ email: "", responsavel: "", departamentoid: "" });
      Swal.fire({ ...swalBase, icon: "success", title: "E-mail cadastrado", timer: 1600, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao cadastrar", text: error.message || "Não foi possível cadastrar o e-mail." });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="dp-moveis-page emails-page">
      <header className="dp-moveis-heading">
        <div>
          <span className="dp-moveis-eyebrow">Tecnologia da Informação</span>
          <h1>Gerenciar e-mails</h1>
          <p>Cadastre um endereço de e-mail e associe-o a um responsável e departamento.</p>
        </div>
      </header>

      <form className="dp-moveis-card dp-moveis-form" onSubmit={handleSubmit}>
        <div className="dp-moveis-card-heading"><div><h2>Novo cadastro</h2><p>Informe os dados do endereço de e-mail.</p></div></div>
        {carregando ? <p className="dp-moveis-message" role="status">Carregando departamentos...</p> : (
          <div className="dp-moveis-form-grid emails-form-grid">
            <label className="dp-moveis-field">
              <span>Endereço de e-mail</span>
              <input autoComplete="email" maxLength={254} name="email" onChange={handleChange} placeholder="usuario@empresa.com" required type="email" value={formulario.email} />
            </label>
            <label className="dp-moveis-field">
              <span>Responsável</span>
              <input autoComplete="name" maxLength={150} name="responsavel" onChange={handleChange} placeholder="Nome do responsável" required value={formulario.responsavel} />
            </label>
            <label className="dp-moveis-field">
              <span>Departamento</span>
              <select className="emails-select" name="departamentoid" onChange={handleChange} required value={formulario.departamentoid}>
                <option value="">Selecione um departamento</option>
                {departamentos.map((departamento) => <option key={departamento.id} value={departamento.id}>{departamento.nome}</option>)}
              </select>
            </label>
          </div>
        )}
        <div className="dp-moveis-form-actions">
          <button className="dp-moveis-button" disabled={salvando || carregando} type="submit">{salvando ? "Salvando..." : "Cadastrar e-mail"}</button>
        </div>
      </form>
    </section>
  );
}
