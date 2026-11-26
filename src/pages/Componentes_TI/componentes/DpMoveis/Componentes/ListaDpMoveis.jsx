import { useCallback, useEffect, useMemo, useState } from "react";
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

function formatarData(data) {
  if (!data) return "—";
  const [ano, mes, dia] = String(data).split("T")[0].split("-");
  if (!ano || !mes || !dia) return "—";
  return `${dia}/${mes}/${ano}`;
}

export default function ListaDpMoveis() {
  const [registros, setRegistros] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);
  const [baixandoId, setBaixandoId] = useState(null);

  const carregarRegistros = useCallback(async () => {
    setCarregando(true);
    try {
      const [resposta, respostaDepartamentos] = await Promise.all([
        Api.CallEndpoint("DpMoveis", "GET"),
        Api.CallEndpoint("Departamentos", "GET"),
      ]);
      const lista = resposta?.dpMoveis || resposta?.registros || resposta;
      const listaDepartamentos = respostaDepartamentos?.departamentos || respostaDepartamentos;
      if (!Array.isArray(lista) || !Array.isArray(listaDepartamentos)) {
        throw new Error("A resposta da API não contém listas válidas de aparelhos e departamentos.");
      }
      setRegistros(lista);
      setDepartamentos(listaDepartamentos);
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
      [registro.departamentoNome, registro.departamento, registro.aparelho, registro.responsavel, registro.contato, registro.nomeArquivoTermo]
        .some((valor) => valor?.toLocaleLowerCase("pt-BR").includes(termo)),
    );
  }, [filtro, registros]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const iniciarEdicao = (registro) => {
    setFormulario({
      departamentoId: String(registro.departamentoId ?? ""),
      aparelho: registro.aparelho || "",
      responsavel: registro.responsavel || "",
      contato: registro.contato || "",
      dataDoTermo: registro.dataDoTermo ? String(registro.dataDoTermo).slice(0, 10) : "",
    });
    setEditandoId(registro.id);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setFormulario(formularioInicial);
  };

  const salvarEdicao = async (event) => {
    event.preventDefault();
    const registro = {
      departamentoId: Number(formulario.departamentoId),
      aparelho: formulario.aparelho.trim(),
      responsavel: formulario.responsavel.trim(),
      contato: formulario.contato.trim() || null,
      dataDoTermo: formulario.dataDoTermo ? `${formulario.dataDoTermo}T00:00:00Z` : "",
    };
    if (!registro.departamentoId || !registro.aparelho || !registro.responsavel || !formulario.dataDoTermo) {
      Swal.fire({ ...swalBase, icon: "warning", title: "Campos obrigatórios", text: "Selecione um departamento e preencha aparelho, responsável e data do termo." });
      return;
    }

    setSalvando(true);
    try {
      await Api.CallEndpoint("DpMoveis", "PUT", registro, editandoId);
      cancelarEdicao();
      await carregarRegistros();
      Swal.fire({ ...swalBase, icon: "success", title: "Registro atualizado", timer: 1600, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao atualizar", text: error.message || "Não foi possível atualizar o Dp Móveis." });
    } finally {
      setSalvando(false);
    }
  };

  const excluirRegistro = async (registro) => {
    const confirmacao = await Swal.fire({
      ...swalBase,
      icon: "warning",
      title: "Excluir cadastro?",
      text: `O cadastro de ${registro.aparelho} será removido permanentemente.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
    });
    if (!confirmacao.isConfirmed) return;

    setExcluindoId(registro.id);
    try {
      await Api.CallEndpoint("DpMoveis", "DELETE", null, registro.id);
      if (editandoId === registro.id) cancelarEdicao();
      await carregarRegistros();
      Swal.fire({ ...swalBase, icon: "success", title: "Cadastro excluído", timer: 1600, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao excluir", text: error.message || "Não foi possível excluir o Dp Móveis." });
    } finally {
      setExcluindoId(null);
    }
  };

  const baixarTermo = async (registro) => {
    setBaixandoId(registro.id);
    try {
      const arquivo = await Api.CallEndpoint(`DpMoveis/${registro.id}/termo`, "GET", null, null, "blob");
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement("a");
      link.href = url;
      link.download = registro.nomeArquivoTermo || `termo-dpmoveis-${registro.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao baixar o termo", text: error.message || "Não foi possível baixar o arquivo." });
    } finally {
      setBaixandoId(null);
    }
  };

  return (
    <section className="dp-moveis-page">
      <header className="dp-moveis-heading">
        <div>
          <span className="dp-moveis-eyebrow">Tecnologia da Informação</span>
          <h1>Dp Móveis</h1>
          <p>Consulte aparelhos e termos de responsabilidade.</p>
        </div>
        <div className="dp-moveis-total" aria-live="polite">
          <strong>{registros.length}</strong>
          <span>{registros.length === 1 ? "registro" : "registros"}</span>
        </div>
      </header>

      <section className="dp-moveis-card" aria-labelledby="dp-moveis-list-title">
        <div className="dp-moveis-list-heading">
          <div>
            <h2 id="dp-moveis-list-title">Aparelhos cadastrados</h2>
            <p>Consulte os aparelhos e os termos de responsabilidade.</p>
          </div>
          <label className="dp-moveis-search">
            <span className="visually-hidden">Buscar aparelhos</span>
            <input onChange={(event) => setFiltro(event.target.value)} placeholder="Buscar por departamento, aparelho, responsável ou contato" type="search" value={filtro} />
          </label>
        </div>

        {editandoId !== null && (
          <form className="dp-moveis-edit-form" onSubmit={salvarEdicao}>
            <h3>Editar aparelho</h3>
            <div className="dp-moveis-form-grid">
              <label className="dp-moveis-field"><span>Departamento</span>
                <select className="dp-moveis-select" name="departamentoId" onChange={handleChange} required value={formulario.departamentoId}>
                  <option value="">Selecione um departamento</option>
                  {departamentos.map((departamento) => <option key={departamento.id} value={departamento.id}>{departamento.nome}</option>)}
                </select>
              </label>
              <label className="dp-moveis-field"><span>Aparelho</span>
<input maxLength={150} name="aparelho" onChange={handleChange} required value={formulario.aparelho} /></label>
              <label className="dp-moveis-field"><span>Responsável</span><input maxLength={100} name="responsavel" onChange={handleChange} required value={formulario.responsavel} /></label>
              <label className="dp-moveis-field"><span>Contato</span><input maxLength={150} name="contato" onChange={handleChange} value={formulario.contato} /></label>
              <label className="dp-moveis-field"><span>Data do termo</span><input name="dataDoTermo" onChange={handleChange} required type="date" value={formulario.dataDoTermo} /></label>
            </div>
            <div className="dp-moveis-edit-actions">
              <button className="dp-moveis-button" disabled={salvando} type="submit">{salvando ? "Salvando..." : "Salvar alterações"}</button>
              <button className="dp-moveis-cancel-button" disabled={salvando} onClick={cancelarEdicao} type="button">Cancelar</button>
            </div>
          </form>
        )}

        {carregando ? (
          <p className="dp-moveis-message" role="status">Carregando registros...</p>
        ) : registrosFiltrados.length === 0 ? (
          <p className="dp-moveis-message">{filtro ? "Nenhum registro corresponde à busca." : "Ainda não há aparelhos cadastrados."}</p>
        ) : (
          <div className="table-responsive dp-moveis-table-wrap">
            <table className="table align-middle dp-moveis-table">
              <thead><tr><th scope="col">Departamento</th><th scope="col">Aparelho</th><th scope="col">Responsável</th><th scope="col">Contato</th><th scope="col">Data do termo</th><th scope="col">Arquivo</th><th scope="col">Ações</th></tr></thead>
              <tbody>
                {registrosFiltrados.map((registro) => (
                  <tr key={registro.id}>
                    <td>{registro.departamentoNome || registro.departamento || "—"}</td>
                    <td>{registro.aparelho || "—"}</td>
                    <td>{registro.responsavel || "—"}</td>
                    <td>{registro.contato || "—"}</td>
                    <td>{formatarData(registro.dataDoTermo)}</td>
                    <td>{registro.possuiTermoPdf || registro.nomeArquivoTermo ? (
                      <button className="dp-moveis-download" disabled={baixandoId === registro.id} onClick={() => baixarTermo(registro)} type="button">{baixandoId === registro.id ? "Baixando..." : "Baixar PDF"}</button>
                    ) : <span className="dp-moveis-no-file">Sem PDF</span>}</td>
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
