import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Api from "../../Services/EndPoint";
import { useNavigate } from "react-router-dom";

export default function FormularioChamado() {
  const [nomemotorista, setNomemotorista] = useState("");0
  const [transportadora, setTransportadora] = useState("");
  const [servico, setServico] = useState("");0
  const [cnh, setCnh] = useState("");0
  const [contato, setContato] = useState("");0
  const [placa, setPlaca] = useState("");0
  const [veiculo, setVeiculo] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("");0
  const [numerodecoleta, setnumerodecoleta] = useState("");0
  const [bauFechado, setBauFechado] = useState("false");0
  const [volumes, setVolumes] = useState("");0

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const carregarVeiculos = async () => {
    try {
      const response = await Api.CallEndpoint("Veiculos", "GET");
      setVeiculo(response);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao carregar veículos.",
      });
    }
  };

  const abrirChamado = async (e) => {
    e.preventDefault();

    if (!nomemotorista || !servico || !categoria) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha todos os campos.",
      });
      return;
    }

    try {
      await Api.CallEndpoint("Chamados", "POST", {
        nomemotorista,
        servico,
        transportadora,
        categoria,
        cnh,
        contato,
        placa,
        numerodecoleta,
        veiculoId: veiculoSelecionado ? Number(veiculoSelecionado) : null,
        bauFechado: bauFechado === "true",
        volumes: volumes ? Number(volumes) : null,
        mensagemCheckin,
        mensagemColeta,
      });

      Swal.fire({
        icon: "success",
        title: "Chamado aberto",
        text: "Seu chamado foi registrado com sucesso.",
      });

      setNomemotorista("");
      setServico("");
      setTransportadora("");
      setCategoria("");
      setCnh("");
      setContato("");
      setPlaca("");
      setVeiculo([]);
      setVeiculoSelecionado("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message,
      });
    }
  };
  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-welcome">
          <h1 className="home-title">Cadastro de coleta</h1>
          <p className="home-subtitle">Cadastro para realizar Coleta</p>
        </div>

        <div className="chamado-card">
          <h3 className="home-title">Motorista</h3>
          <form onSubmit={abrirChamado}>
            <div className="chamado-group">
              <label>Nome do Motorista</label>
              <input
                type="text"
                value={nomemotorista}
                onChange={(e) => setNomemotorista(e.target.value)}
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="chamado-group">
              <label>CNH</label>
              <input
                type="text"
                value={cnh}
                onChange={(e) => setCnh(e.target.value)}
                placeholder="Ex: 7584215897"
              />
            </div>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Telefone / Whatsapp (não utilize espaços)</label>
                <input
                  type="text"
                  value={numerodecoleta}
                  onChange={(e) => setnumerodecoleta(e.target.value)}
                  placeholder="Ex: 11919392917"
                />
              </div>
            </div>

            <h3 className="home-title">Veiculo</h3>
            <div className="chamado-row">
              <div className="chamado-group">
                <label>Tipo do veículo</label>
                <select
                  value={veiculoSelecionado}
                  onChange={(e) => setVeiculoSelecionado(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {veiculo.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="chamado-group">
                <label>Baú / Fechado?</label>
                <select
                  value={bauFechado}
                  onChange={(e) => setBauFechado(e.target.value)}
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
            </div>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Placa do veiculo</label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                />
              </div>
            </div>

            <h3 className="home-title">Dados da coleta</h3>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Irá realizar: </label>
                <select
                  value={servico}
                  onChange={(e) => setServico(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Coleta">Coleta</option>
                  <option value="Retira">Retira</option>
                </select>
              </div>


              <div className="chamado-row">
                <div className="chamado-group">
                  <label>Numero de coleta</label>
                  <input
                    type="text"
                    value={numerodecoleta}
                    onChange={(e) => setnumerodecoleta(e.target.value)}
                    placeholder="Numero de coleta"
                  />
                </div>
              </div>
            </div>
            <div className="chamado-group">
              <label>Volumes (Caixas)</label>
              <input
                type="number"
                min="0"
                value={volumes}
                onChange={(e) => setVolumes(e.target.value)}
              />
            </div>

            <button type="submit" className="chamado-button">
              Abrir Chamado
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
