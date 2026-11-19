import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Api from "../../Services/EndPoint";
import { useNavigate } from "react-router-dom";

export default function FormularioChamado() {
  const [nomemotorista, setNomemotorista] = useState("");
  const [categoria, setCategoria] = useState("");
  const [transportadora, setTransportadora] = useState("");
  const [servico, setServico] = useState("");
  const [cnh, setCnh] = useState("");
  const [contato, setContato] = useState("");
  const [placa, setPlaca] = useState("");
  const [veiculo, setVeiculo] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("");
  const [numerodecoleta, setnumerodecoleta] = useState("");
  const [bauFechado, setBauFechado] = useState("false");
  const [volumes, setVolumes] = useState("");
  const [mensagemCheckin, setMensagemCheckin] = useState("");
  const [mensagemColeta, setMensagemColeta] = useState("");

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
          <h1 className="home-title">Abrir Chamado</h1>
          <p className="home-subtitle">
            Registre uma nova solicitação para a equipe de TI.
          </p>
        </div>

        <div className="chamado-card">
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
                <label>Numero de Coleta/NF</label>
                <input
                  type="text"
                  value={numerodecoleta}
                  onChange={(e) => setnumerodecoleta(e.target.value)}
                />
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
            </div>

            <div className="chamado-group">
              <label>Mensagem check-in</label>
              <textarea
                rows={3}
                value={mensagemCheckin}
                onChange={(e) => setMensagemCheckin(e.target.value)}
              />
            </div>

            <div className="chamado-group">
              <label>Mensagem Coleta</label>
              <textarea
                rows={3}
                value={mensagemColeta}
                onChange={(e) => setMensagemColeta(e.target.value)}
              />
            </div>

            <div className="chamado-group">
              <label>Transportadora</label>
              <input
                type="text"
                value={transportadora}
                onChange={(e) => setTransportadora(e.target.value)}
                placeholder="Nome da transportadora."
              />
            </div>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Rede">Rede</option>
                  <option value="Impressora">Impressora</option>
                </select>
              </div>

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
            </div>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>tipo de veículo</label>
                <select
                  value={veiculoSelecionado}
                  onChange={(e) => setVeiculoSelecionado(e.target.value)}
                >
                  <option class="form-control" value="">
                    Selecione
                  </option>
                  {veiculo.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.modelo}
                    </option>
                  ))}
                </select>

                <div className="chamado-group">
                  <label>Numero de coleta</label>
                  <input
                    type="text"
                    value={numerodecoleta}
                    onChange={(e) => setnumerodecoleta(e.target.value)}
                    placeholder="Numero de coleta"
                  />
                </div>

                <div className="chamado-group">
                  <label>Seu veiculo é aberto</label>
                  <select
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                  >
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </select>
                </div>
              </div>
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
