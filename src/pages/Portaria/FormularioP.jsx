import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api from "../../Services/EndPoint";
import "./FormularioP.css";

const formularioInicial = {
  despachante: "",
  motorista: "",
  cnh: "",
  telefoneMotorista: "",
  transportadora: "",
  veiculo: "",
  veiculoAberto: "false",
  placa: "",
  servico: "",
  numeroNf: "",
  quantidade: "",
};

export default function FormularioP() {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [veiculos, setVeiculos] = useState([]);
  const [carregandoVeiculos, setCarregandoVeiculos] = useState(true);
  const [erroVeiculos, setErroVeiculos] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const carregarVeiculos = async () => {
      setCarregandoVeiculos(true);
      setErroVeiculos("");

      try {
        const resposta = await Api.CallEndpoint("Veiculos", "GET");
        if (!Array.isArray(resposta)) {
          throw new Error("A resposta da lista de veículos está em formato inválido.");
        }
        setVeiculos(resposta);
      } catch (error) {
        setErroVeiculos(error.message || "Não foi possível carregar os veículos.");
        Swal.fire({
          icon: "error",
          title: "Erro ao carregar veículos",
          text: error.message || "Tente novamente mais tarde.",
        });
      } finally {
        setCarregandoVeiculos(false);
      }
    };

    carregarVeiculos();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const enviarFormulario = async (event) => {
    event.preventDefault();
    setEnviando(true);

    const dados = {
      despachante: formulario.despachante.trim(),
      motorista: formulario.motorista.trim(),
      cnh: formulario.cnh.trim() || null,
      telefoneMotorista: formulario.telefoneMotorista.trim() || null,
      transportadora: formulario.transportadora.trim() || null,
      veiculo: formulario.veiculo ? Number(formulario.veiculo) : null,
      veiculoAberto: formulario.veiculoAberto === "true",
      placa: formulario.placa.trim().toUpperCase() || null,
      servico: formulario.servico,
      numeroNf: formulario.numeroNf.trim() || null,
      quantidade: formulario.quantidade || null,
      dataEntrada: new Date().toISOString(),
      verificado: false,
      liberado: false,
    };

    try {
      await Api.CallEndpoint("Acessos", "POST", dados);
      await Swal.fire({
        icon: "success",
        title: "Cadastro realizado",
        text: "Os dados foram enviados para a portaria.",
      });
      setFormulario(formularioInicial);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Não foi possível enviar",
        text: error.message || "Ocorreu um erro ao enviar os dados.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="formulario-p-page">
      <div className="formulario-p-container">
        <header className="formulario-p-header">
          <span className="formulario-p-eyebrow">Portaria</span>
          <h1>Cadastro de coleta</h1>
          <p>Preencha os dados do motorista e da coleta para registro na portaria.</p>
        </header>

        <form className="formulario-p-card" onSubmit={enviarFormulario}>
          <section className="formulario-p-section" aria-labelledby="formulario-p-motorista">
            <div className="formulario-p-section-title">
              <span className="formulario-p-step">01</span>
              <div>
                <h2 id="formulario-p-motorista">Motorista e responsável</h2>
                <p>Identifique o motorista e quem está registrando a entrada.</p>
              </div>
            </div>

            <div className="formulario-p-grid">
              <label className="formulario-p-field">
                <span>Despachante <b aria-hidden="true">*</b></span>
                <input autoComplete="name" maxLength={100} name="despachante" onChange={handleChange} required value={formulario.despachante} />
              </label>
              <label className="formulario-p-field">
                <span>Nome do motorista <b aria-hidden="true">*</b></span>
                <input autoComplete="name" maxLength={150} name="motorista" onChange={handleChange} placeholder="Ex.: João da Silva" required value={formulario.motorista} />
              </label>
              <label className="formulario-p-field">
                <span>CNH</span>
                <input autoComplete="off" maxLength={30} name="cnh" onChange={handleChange} value={formulario.cnh} />
              </label>
              <label className="formulario-p-field">
                <span>Telefone / WhatsApp</span>
                <input autoComplete="tel" inputMode="tel" maxLength={30} name="telefoneMotorista" onChange={handleChange} placeholder="Ex.: (11) 99999-9999" value={formulario.telefoneMotorista} />
              </label>
              <label className="formulario-p-field">
                <span>Transportadora</span>
                <input maxLength={150} name="transportadora" onChange={handleChange} value={formulario.transportadora} />
              </label>
            </div>
          </section>

          <section className="formulario-p-section" aria-labelledby="formulario-p-veiculo">
            <div className="formulario-p-section-title">
              <span className="formulario-p-step">02</span>
              <div>
                <h2 id="formulario-p-veiculo">Veículo</h2>
                <p>Informe o tipo de veículo e os dados de identificação.</p>
              </div>
            </div>

            <div className="formulario-p-grid">
              <label className="formulario-p-field">
                <span>Tipo do veículo</span>
                <select disabled={carregandoVeiculos} name="veiculo" onChange={handleChange} value={formulario.veiculo}>
                  <option value="">{carregandoVeiculos ? "Carregando veículos..." : "Selecione"}</option>
                  {veiculos.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>{veiculo.modelo}</option>
                  ))}
                </select>
              </label>
              <label className="formulario-p-field">
                <span>Veículo aberto?</span>
                <select name="veiculoAberto" onChange={handleChange} value={formulario.veiculoAberto}>
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </label>
              <label className="formulario-p-field">
                <span>Placa</span>
                <input autoCapitalize="characters" maxLength={10} name="placa" onChange={handleChange} placeholder="Ex.: ABC1D23" value={formulario.placa} />
              </label>
            </div>
            {erroVeiculos && <p className="formulario-p-error" role="alert">{erroVeiculos}</p>}
          </section>

          <section className="formulario-p-section" aria-labelledby="formulario-p-coleta">
            <div className="formulario-p-section-title">
              <span className="formulario-p-step">03</span>
              <div>
                <h2 id="formulario-p-coleta">Dados da coleta</h2>
                <p>Complete as informações sobre o serviço e a carga.</p>
              </div>
            </div>

            <div className="formulario-p-grid">
              <label className="formulario-p-field">
                <span>Serviço <b aria-hidden="true">*</b></span>
                <select name="servico" onChange={handleChange} required value={formulario.servico}>
                  <option value="">Selecione</option>
                  <option value="Coleta">Coleta</option>
                  <option value="Retira">Retira</option>
                </select>
              </label>
              <label className="formulario-p-field">
                <span>Número da NF / coleta</span>
                <input maxLength={100} name="numeroNf" onChange={handleChange} value={formulario.numeroNf} />
              </label>
              <label className="formulario-p-field">
                <span>Quantidade de volumes</span>
                <input min="0" name="quantidade" onChange={handleChange} type="number" value={formulario.quantidade} />
              </label>
            </div>
          </section>

          <div className="formulario-p-actions">
            <p><b>*</b> Campos obrigatórios</p>
            <button disabled={enviando} type="submit">
              {enviando ? "Enviando..." : "Enviar cadastro"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
