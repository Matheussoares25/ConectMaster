import { Fragment, useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api, { swalBase } from "../../../Services/EndPoint";

export default function CadastroVeiculo() {
  const [modelo, setModelo] = useState("");
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [modeloEditado, setModeloEditado] = useState("");
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");

  const carregarVeiculos = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await Api.CallEndpoint("Veiculos", "GET");
      if (!Array.isArray(resposta)) {
        throw new Error("A API não retornou uma lista válida de veículos.");
      }
      setVeiculos(resposta);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os veículos cadastrados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarVeiculos();
  }, [carregarVeiculos]);

  const cadastrarVeiculo = async (event) => {
    event.preventDefault();
    const nomeModelo = modelo.trim();
    if (!nomeModelo) return;

    setSalvando(true);
    setErro("");
    try {
      await Api.CallEndpoint("Veiculos", "POST", { modelo: nomeModelo });
      setModelo("");
      await carregarVeiculos();
      await Swal.fire({ ...swalBase, icon: "success", title: "Veículo cadastrado", timer: 1600, showConfirmButton: false });
    } catch (error) {
      setErro(error.message || "Não foi possível cadastrar o veículo.");
    } finally {
      setSalvando(false);
    }
  };

  const iniciarEdicao = (veiculo) => {
    if (editandoId === veiculo.id) {
      setEditandoId(null);
      setModeloEditado("");
      return;
    }
    setEditandoId(veiculo.id);
    setModeloEditado(veiculo.modelo || "");
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setModeloEditado("");
  };

  const salvarEdicao = async (event) => {
    event.preventDefault();
    const nomeModelo = modeloEditado.trim();
    if (!nomeModelo || editandoId === null) return;

    setSalvando(true);
    try {
      await Api.CallEndpoint("Veiculos", "PUT", { modelo: nomeModelo }, editandoId);
      cancelarEdicao();
      await carregarVeiculos();
      await Swal.fire({ ...swalBase, icon: "success", title: "Veículo atualizado", timer: 1600, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao atualizar", text: error.message || "Não foi possível atualizar o veículo." });
    } finally {
      setSalvando(false);
    }
  };

  const excluirVeiculo = async (veiculo) => {
    const confirmacao = await Swal.fire({
      ...swalBase,
      icon: "warning",
      title: "Excluir veículo?",
      text: `O modelo ${veiculo.modelo} será removido permanentemente.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
    });
    if (!confirmacao.isConfirmed) return;

    setExcluindoId(veiculo.id);
    try {
      await Api.CallEndpoint("Veiculos", "DELETE", null, veiculo.id);
      if (editandoId === veiculo.id) cancelarEdicao();
      await carregarVeiculos();
      await Swal.fire({ ...swalBase, icon: "success", title: "Veículo excluído", timer: 1600, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalBase, icon: "error", title: "Erro ao excluir", text: error.message || "Não foi possível excluir o veículo." });
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <section className="portaria-page">
      <header className="portaria-page-header">
        <div>
          <span className="portaria-eyebrow">Portaria</span>
          <h1>Cadastrar veículo</h1>
          <p>Adicione um modelo à lista de veículos disponível nos cadastros de acesso.</p>
        </div>
      </header>

      <form className="portaria-form-card" onSubmit={cadastrarVeiculo}>
        <label className="portaria-field" htmlFor="portaria-veiculo-modelo">
          <span>Modelo do veículo <b aria-hidden="true">*</b></span>
          <input
            autoComplete="off"
            id="portaria-veiculo-modelo"
            maxLength={150}
            onChange={(event) => setModelo(event.target.value)}
            placeholder="Ex.: Caminhão baú"
            required
            value={modelo}
          />
        </label>
        {erro && <p className="portaria-error-message" role="alert">{erro}</p>}
        <div className="portaria-form-actions">
          <p><b>*</b> Campo obrigatório</p>
          <button className="portaria-primary-button" disabled={salvando || !modelo.trim()} type="submit">
            {salvando ? "Cadastrando..." : "Cadastrar veículo"}
          </button>
        </div>
      </form>

      <section className="portaria-list-card portaria-vehicles-card" aria-labelledby="portaria-veiculos-lista">
        <div className="portaria-list-toolbar">
          <div>
            <h2 id="portaria-veiculos-lista">Veículos cadastrados</h2>
            <p>{veiculos.length} {veiculos.length === 1 ? "modelo" : "modelos"}</p>
          </div>
          <button className="portaria-refresh" disabled={carregando} onClick={carregarVeiculos} type="button">
            {carregando ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        {carregando ? (
          <p className="portaria-message" role="status">Carregando veículos...</p>
        ) : veiculos.length === 0 ? (
          <p className="portaria-message">Nenhum veículo cadastrado.</p>
        ) : (
          <div className="table-responsive">
            <table className="table portaria-table align-middle mb-0">
              <thead>
                <tr><th scope="col">ID</th><th scope="col">Modelo</th><th scope="col">Ações</th></tr>
              </thead>
              <tbody>
                {veiculos.map((veiculo) => (
                  <Fragment key={veiculo.id}>
                    <tr>
                      <td>{veiculo.id}</td>
                      <td>{veiculo.modelo || "—"}</td>
                      <td>
                        <div className="portaria-row-actions">
                          <button className="btn-edit" disabled={salvando || excluindoId === veiculo.id} onClick={() => iniciarEdicao(veiculo)} type="button">{editandoId === veiculo.id ? "Fechar edição" : "Editar"}</button>
                          <button className="btn-delete" disabled={salvando || excluindoId === veiculo.id} onClick={() => excluirVeiculo(veiculo)} type="button">{excluindoId === veiculo.id ? "Excluindo..." : "Excluir"}</button>
                        </div>
                      </td>
                    </tr>
                    {editandoId === veiculo.id && (
                      <tr key={`${veiculo.id}-edit`}>
                        <td className="portaria-edit-cell" colSpan={3}>
                          <form className="portaria-vehicle-edit" onSubmit={salvarEdicao}>
                            <label className="portaria-field" htmlFor={`portaria-modelo-edit-${veiculo.id}`}>
                              <span>Modelo do veículo</span>
                              <input autoComplete="off" id={`portaria-modelo-edit-${veiculo.id}`} maxLength={150} onChange={(event) => setModeloEditado(event.target.value)} required value={modeloEditado} />
                            </label>
                            <div className="portaria-edit-actions">
                              <button className="portaria-primary-button" disabled={salvando || !modeloEditado.trim()} type="submit">{salvando ? "Salvando..." : "Salvar alterações"}</button>
                              <button className="portaria-refresh" disabled={salvando} onClick={cancelarEdicao} type="button">Cancelar</button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
