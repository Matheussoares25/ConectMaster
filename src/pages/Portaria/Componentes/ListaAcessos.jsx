import { useCallback, useEffect, useState } from "react";
import Api from "../../../Services/EndPoint";

const lerCampo = (registro, ...nomes) => {
  for (const nome of nomes) {
    if (registro?.[nome] !== undefined && registro[nome] !== null) {
      return registro[nome];
    }
  }
  return null;
};

const formatarData = (data) => {
  if (!data) return "—";
  const valor = new Date(data);
  return Number.isNaN(valor.getTime()) ? "—" : valor.toLocaleString("pt-BR");
};

const formatarSimNao = (valor) => valor === true ? "Sim" : valor === false ? "Não" : "—";

export default function ListaAcesso() {
  const [acessos, setAcessos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("");

  const carregarAcessos = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await Api.CallEndpoint("Acessos", "GET");
      const lista = resposta?.acessos || resposta;
      if (!Array.isArray(lista)) {
        throw new Error("A API não retornou uma lista válida de acessos.");
      }
      setAcessos(lista);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os acessos cadastrados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarAcessos();
  }, [carregarAcessos]);

  const termo = filtro.trim().toLocaleLowerCase("pt-BR");
  const acessosFiltrados = acessos.filter((acesso) => {
    if (!termo) return true;
    const campos = [
      acesso.id,
      lerCampo(acesso, "motorista", "Motorista"),
      lerCampo(acesso, "despachante", "Despachante"),
      lerCampo(acesso, "transportadora", "Transportadora"),
      lerCampo(acesso, "placa", "Placa"),
      lerCampo(acesso, "numero_nf", "numeroNf", "Numero_nf"),
    ];
    return campos.some((campo) => String(campo ?? "").toLocaleLowerCase("pt-BR").includes(termo));
  });

  return (
    <section className="portaria-page">
      <header className="portaria-page-header">
        <div>
          <span className="portaria-eyebrow">Portaria</span>
          <h1>Acessos cadastrados</h1>
          <p>Consulte os cadastros de entrada enviados para a portaria.</p>
        </div>
        <button className="portaria-refresh" disabled={carregando} onClick={carregarAcessos} type="button">
          {carregando ? "Atualizando..." : "Atualizar lista"}
        </button>
      </header>

      <div className="portaria-list-card">
        <div className="portaria-list-toolbar">
          <p>{acessos.length} {acessos.length === 1 ? "cadastro" : "cadastros"}</p>
          <label className="portaria-search">
            <span className="visually-hidden">Buscar cadastro</span>
            <input onChange={(event) => setFiltro(event.target.value)} placeholder="Buscar motorista, placa ou NF" type="search" value={filtro} />
          </label>
        </div>

        {carregando ? (
          <p className="portaria-message" role="status">Carregando cadastros...</p>
        ) : erro ? (
          <div className="portaria-error" role="alert">
            <p>{erro}</p>
            <button className="portaria-refresh" onClick={carregarAcessos} type="button">Tentar novamente</button>
          </div>
        ) : acessosFiltrados.length === 0 ? (
          <p className="portaria-message">{acessos.length ? "Nenhum cadastro corresponde à busca." : "Ainda não há acessos cadastrados."}</p>
        ) : (
          <div className="table-responsive portaria-table-viewport">
            <table className="table portaria-table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Entrada</th>
                  <th>Motorista</th>
                  <th>CNH</th>
                  <th>Telefone</th>
                  <th>Transportadora</th>
                  <th>Serviço</th>
                  <th>Veículo</th>
                  <th>Placa</th>
                  <th>Veículo aberto</th>
                  <th>NF / coleta</th>
                  <th>Volumes</th>
                  <th>Despachante</th>
                  <th>Verificado</th>
                  <th>Liberado</th>
                </tr>
              </thead>
              <tbody>
                {acessosFiltrados.map((acesso) => {
                  const veiculo = lerCampo(acesso, "veiculos", "Veiculos");
                  return (
                    <tr key={lerCampo(acesso, "id", "Id")}>
                      <td>{lerCampo(acesso, "id", "Id") ?? "—"}</td>
                      <td className="text-nowrap">{formatarData(lerCampo(acesso, "data_entrada", "dataEntrada", "Data_entrada"))}</td>
                      <td>{lerCampo(acesso, "motorista", "Motorista") || "—"}</td>
                      <td>{lerCampo(acesso, "cnh", "Cnh", "CNH") || "—"}</td>
                      <td>{lerCampo(acesso, "telefone_motorista", "telefoneMotorista", "Telefone_motorista") || "—"}</td>
                      <td>{lerCampo(acesso, "transportadora", "Transportadora") || "—"}</td>
                      <td>{lerCampo(acesso, "servico", "Servico") || "—"}</td>
                      <td>{lerCampo(veiculo, "modelo", "Modelo") || "—"}</td>
                      <td>{lerCampo(acesso, "placa", "Placa") || "—"}</td>
                      <td>{formatarSimNao(lerCampo(acesso, "veiculo_aberto", "veiculoAberto", "Veiculo_aberto"))}</td>
                      <td>{lerCampo(acesso, "numero_nf", "numeroNf", "Numero_nf") || "—"}</td>
                      <td>{lerCampo(acesso, "quantidade", "Quantidade") || "—"}</td>
                      <td>{lerCampo(acesso, "despachante", "Despachante") || "—"}</td>
                      <td>{formatarSimNao(lerCampo(acesso, "verificado", "Verificado"))}</td>
                      <td>{formatarSimNao(lerCampo(acesso, "liberado", "Liberado"))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
