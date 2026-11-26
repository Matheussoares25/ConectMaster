import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Api, { swalBase } from "../../../../../Services/EndPoint";
import "../Emails.css";

const formularioInicial = { email: "", responsavel: "", departamentoid: "" };

export default function ListaEmails() {
  const [registros, setRegistros] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [respostaEmails, respostaDepartamentos] = await Promise.all([
        Api.CallEndpoint("Emails", "GET"),
        Api.CallEndpoint("Departamentos", "GET"),
      ]);
      const listaEmails = respostaEmails?.emails || respostaEmails;
      const listaDepartamentos = respostaDepartamentos?.departamentos || respostaDepartamentos;
      if (!Array.isArray(listaEmails) || !Array.isArray(listaDepartamentos)) {
        throw new Error("A resposta da API não contém listas válidas de e-mails e departamentos.");
      }
      setRegistros(listaEmails);
      setDepartamentos(listaDepartamentos);
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao carregar", text: error.message || "Não foi possível carregar os e-mails e departamentos." });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const registrosFiltrados = useMemo(() => {
    const termo = filtro.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return registros;
    return registros.filter((registro) => [registro.email, registro.responsavel, registro.departamento?.nome]
      .some((valor) => valor?.toLocaleLowerCase("pt-BR").includes(termo)));
  }, [filtro, registros]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const iniciarEdicao = (registro) => {
    setFormulario({
      email: registro.email || "",
      responsavel: registro.responsavel || "",
      departamentoid: String(registro.departamentoid ?? registro.departamento?.id ?? ""),
    });
    setEditandoId(registro.id);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setFormulario(formularioInicial);
  };

  const salvarEdicao = async (event) => {
    event.preventDefault();
    const dados = { email: formulario.email.trim(), responsavel: formulario.responsavel.trim(), departamentoid: Number(formulario.departamentoid) };
    if (!dados.email || !dados.responsavel || !dados.departamentoid) {
      Swal.fire({ ...swalBase, icon: "warning", title: "Campos obrigatórios", text: "Informe o e-mail, o responsável e o departamento." });
      return;
    }

    setSalvando(true);
    try {
      await Api.CallEndpoint("Emails", "PUT", dados, editandoId);
      cancelarEdicao();
      await carregarDados();
      Swal.fire({ ...swalBase, icon: "success", title: "Cadastro atualizado", timer: 1600, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao atualizar", text: error.message || "Não foi possível atualizar o cadastro." });
    } finally {
      setSalvando(false);
    }
  };

  const excluirRegistro = async (registro) => {
    const confirmacao = await Swal.fire({
      ...swalBase,
      icon: "warning",
      title: "Excluir cadastro?",
      text: `O e-mail ${registro.email} será removido permanentemente.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
    });
    if (!confirmacao.isConfirmed) return;

    setExcluindoId(registro.id);
    try {
      await Api.CallEndpoint("Emails", "DELETE", null, registro.id);
      if (editandoId === registro.id) cancelarEdicao();
      await carregarDados();
      Swal.fire({ ...swalBase, icon: "success", title: "Cadastro excluído", timer: 1600, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao excluir", text: error.message || "Não foi possível excluir o cadastro." });
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <section className="dp-moveis-page emails-page">
      <header className="dp-moveis-heading">
        <div>
          <span className="dp-moveis-eyebrow">Tecnologia da Informação</span>
          <h1>Gerenciar e-mails</h1>
          <p>Consulte endereços de e-mail, responsáveis e departamentos.</p>
        </div>
        <div className="dp-moveis-total" aria-live="polite"><strong>{registros.length}</strong><span>{registros.length === 1 ? "cadastro" : "cadastros"}</span></div>
      </header>

      <section className="dp-moveis-card" aria-labelledby="emails-list-title">
        <div className="dp-moveis-list-heading">
          <div><h2 id="emails-list-title">E-mails cadastrados</h2><p>Consulte, edite ou remova os cadastros existentes.</p></div>
          <label className="dp-moveis-search"><span className="visually-hidden">Buscar e-mails</span><input onChange={(event) => setFiltro(event.target.value)} placeholder="Buscar por e-mail, responsável ou departamento" type="search" value={filtro} /></label>
        </div>

        {editandoId !== null && (
          <form className="dp-moveis-edit-form" onSubmit={salvarEdicao}>
            <h3>Editar cadastro</h3>
            <div className="dp-moveis-form-grid emails-form-grid">
              <label className="dp-moveis-field"><span>Endereço de e-mail</span><input autoComplete="email" maxLength={254} name="email" onChange={handleChange} required type="email" value={formulario.email} /></label>
              <label className="dp-moveis-field"><span>Responsável</span><input autoComplete="name" maxLength={150} name="responsavel" onChange={handleChange} required value={formulario.responsavel} /></label>
              <label className="dp-moveis-field"><span>Departamento</span>
                <select className="emails-select" name="departamentoid" onChange={handleChange} required value={formulario.departamentoid}>
                  <option value="">Selecione um departamento</option>
                  {departamentos.map((departamento) => <option key={departamento.id} value={departamento.id}>{departamento.nome}</option>)}
                </select>
              </label>
            </div>
            <div className="dp-moveis-edit-actions">
              <button className="dp-moveis-button" disabled={salvando} type="submit">{salvando ? "Salvando..." : "Salvar alterações"}</button>
              <button className="dp-moveis-cancel-button" disabled={salvando} onClick={cancelarEdicao} type="button">Cancelar</button>
            </div>
          </form>
        )}

        {carregando ? <p className="dp-moveis-message" role="status">Carregando cadastros...</p> : registrosFiltrados.length === 0 ? (
          <p className="dp-moveis-message">{filtro ? "Nenhum cadastro corresponde à busca." : "Ainda não há e-mails cadastrados."}</p>
        ) : (
          <div className="table-responsive dp-moveis-table-wrap">
            <table className="table align-middle dp-moveis-table emails-table">
              <thead><tr><th scope="col">E-mail</th><th scope="col">Responsável</th><th scope="col">Departamento</th><th scope="col">Ações</th></tr></thead>
              <tbody>
                {registrosFiltrados.map((registro) => (
                  <tr key={registro.id}>
                    <td><a className="emails-mail-link" href={`mailto:${registro.email}`}>{registro.email || "—"}</a></td>
                    <td>{registro.responsavel || "—"}</td>
                    <td>{registro.departamento?.nome || "—"}</td>
                    <td><div className="dp-moveis-row-actions">
                      <button className="btn-edit" disabled={salvando || excluindoId === registro.id} onClick={() => iniciarEdicao(registro)} type="button">Editar</button>
                      <button className="btn-delete" disabled={salvando || excluindoId === registro.id} onClick={() => excluirRegistro(registro)} type="button">{excluindoId === registro.id ? "Excluindo..." : "Excluir"}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
