import { useState } from "react";
import Swal from "sweetalert2";
import Api from "../../../Services/EndPoint";

export default function OrdemServicoFrete() {
  // Identificação
  const [titulo, setTitulo] = useState("");
  const [email, setEmail] = useState(
    JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"))
      ?.email || "",
  );
  const [setor, setSetor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState(1);

  // Cliente / contratante
  const [clienteNome, setClienteNome] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteContato, setClienteContato] = useState("");

  // Carga
  const [descricaoCarga, setDescricaoCarga] = useState("");
  const [pesoBruto, setPesoBruto] = useState("");
  const [volume, setVolume] = useState("");
  const [qtdVolumes, setQtdVolumes] = useState("");
  const [valorMercadoria, setValorMercadoria] = useState("");
  const [naturezaCarga, setNaturezaCarga] = useState("");

  // Origem e destino
  const [enderecoColeta, setEnderecoColeta] = useState("");
  const [enderecoEntrega, setEnderecoEntrega] = useState("");
  const [dataColeta, setDataColeta] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");

  // Transporte
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState("");
  const [motoristaNome, setMotoristaNome] = useState("");
  const [motoristaTelefone, setMotoristaTelefone] = useState("");

  // Fiscal
  const [numeroNfe, setNumeroNfe] = useState("");
  const [numeroCte, setNumeroCte] = useState("");

  // Valores
  const [valorFrete, setValorFrete] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");

  // Observações
  const [descricao, setDescricao] = useState("");
  const [formBasico, setFormBasico] = useState(true);

  async function abrirChamado(e) {
    e.preventDefault();

    const payload = {
      titulo,
      email,
      setor,
      categoria,
      prioridade,

      cliente: {
        nome: clienteNome,
        documento: clienteDocumento,
        telefone: clienteTelefone,
        contato: clienteContato,
      },

      carga: {
        descricao: descricaoCarga,
        pesoBruto: pesoBruto ? Number(pesoBruto.replace(",", ".")) : null,
        volume: volume ? Number(volume.replace(",", ".")) : null,
        qtdVolumes: qtdVolumes ? Number(qtdVolumes) : null,
        valorMercadoria: valorMercadoria
          ? Number(valorMercadoria.replace(",", "."))
          : null,
        naturezaCarga,
      },

      rota: {
        enderecoColeta,
        enderecoEntrega,
        dataColeta: dataColeta ? new Date(dataColeta).toISOString() : null,
        dataEntrega: dataEntrega ? new Date(dataEntrega).toISOString() : null,
      },

      transporte: {
        placaVeiculo,
        tipoVeiculo,
        motoristaNome,
        motoristaTelefone,
      },

      fiscal: {
        numeroNfe,
        numeroCte,
      },

      valores: {
        valorFrete: valorFrete === "" ? null : Number(valorFrete),
        formaPagamento,
      },

      descricao,
    };
    try {
      await Api.CallEndpoint("servicos", "POST", payload);
      Swal.fire({
        icon: "success",
        title: "Ordem de serviço criada!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message,
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    }
  }

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-welcome">
          <h1 className="home-title">Gerar ordem de serviço</h1>
          <p className="home-subtitle">
            Preencha os campos abaixo para gerar uma ordem de serviço.
          </p>
          <button
            className="chamado-button"
            onClick={() => setFormBasico(!formBasico)}
          >
            Modo Avançado
          </button>
        </div>

        <div className="chamado-card">
          <form onSubmit={abrirChamado}>
            {/* IDENTIFICAÇÃO */}
            <div className="chamado-group">
              <label>Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Frete São Paulo - Rio de Janeiro"
              />
            </div>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Email do Solicitante</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="chamado-group">
                <label>Setor</label>
                <input
                  type="text"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                />
              </div>
            </div>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Frete">Frete</option>
                  <option value="Servico">Serviços gerais</option>
                  <option value="Retirada">Retirada</option>
                  <option value="Outros">Outros tipos de serviços</option>
                </select>
              </div>

              <div className="chamado-group">
                <label>Prioridade</label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(Number(e.target.value))}
                >
                  <option value="1">Baixa</option>
                  <option value="2">Média</option>
                  <option value="3">Alta</option>
                  <option value="4">Crítica</option>
                </select>
              </div>
            </div>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                />
              </div>

              <div className="chamado-group">
                <label>Contato responsável</label>
                <input
                  type="text"
                  value={clienteContato}
                  onChange={(e) => setClienteContato(e.target.value)}
                />
              </div>
            </div>

            {/* TRANSPORTE*/}
            <h3 className="chamado-section-title text-white">
              Dados do transporte
            </h3>

            <div className="chamado-row">
              {!formBasico && (
                <div className="chamado-group">
                  <label>Placa do veículo</label>
                  <input
                    type="text"
                    value={placaVeiculo}
                    onChange={(e) => setPlacaVeiculo(e.target.value)}
                  />
                </div>
              )}

              <div className="chamado-group">
                <label>Tipo de veículo</label>
                <select
                  value={tipoVeiculo}
                  onChange={(e) => setTipoVeiculo(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Carreta">Carreta</option>
                  <option value="Utilitario">Utilitário</option>
                </select>
              </div>
            </div>
            {!formBasico && (
              <div className="chamado-row">
                <div className="chamado-group">
                  <label>Nome do motorista</label>
                  <input
                    type="text"
                    value={motoristaNome}
                    onChange={(e) => setMotoristaNome(e.target.value)}
                  />
                </div>

                <div className="chamado-group">
                  <label>Telefone do motorista</label>
                  <input
                    type="text"
                    value={motoristaTelefone}
                    onChange={(e) => setMotoristaTelefone(e.target.value)}
                  />
                </div>
              </div>
            )}
            {/* ORIGEM E DESTINO */}
            <h3 className="chamado-section-title text-white">
              Origem e destino
            </h3>

            <div className="meios-row">
              <div className="chamado-group">
                <label>Endereço de coleta</label>
                <input
                  type="text"
                  value={enderecoColeta}
                  onChange={(e) => setEnderecoColeta(e.target.value)}
                />
              </div>
            </div>

            <div className="meios-row">
              <div className="chamado-group">
                <label>Endereço de entrega</label>
                <input
                  type="text"
                  value={enderecoEntrega}
                  onChange={(e) => setEnderecoEntrega(e.target.value)}
                />
              </div>
            </div>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Data/hora de coleta</label>
                <input
                  type="datetime-local"
                  value={dataColeta}
                  onChange={(e) => setDataColeta(e.target.value)}
                />
              </div>

              <div className="chamado-group">
                <label>Data/hora de entrega</label>
                <input
                  type="datetime-local"
                  value={dataEntrega}
                  onChange={(e) => setDataEntrega(e.target.value)}
                />
              </div>
            </div>

            {/* VALORES */}
            <h3 className="chamado-section-title text-white">
              Valores e condições
            </h3>

            <div className="chamado-row">
              <div className="chamado-group">
                <label>Valor do frete (R$)</label>
                <input
                  type="number"
                  value={valorFrete}
                  onChange={(e) => setValorFrete(e.target.value)}
                />
              </div>

              <div className="chamado-group">
                <label>Forma de pagamento</label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Pix">Pix</option>
                  <option value="Transferencia">Transferência</option>
                  <option value="Faturado">Faturado</option>
                </select>
              </div>
            </div>

            {/* OBSERVAÇÕES */}
            <div className="chamado-group">
              <label>Descrição</label>
              <textarea
                rows="6"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o problema ou instruções especiais detalhadamente..."
              />
            </div>
            <div className="home-content">
              {!formBasico && (
                <>
                  {/* CLIENTE / CONTRATANTE */}
                  <h3 className="chamado-section-title text-white">
                    Dados do cliente
                  </h3>

                  <div className="chamado-row">
                    <div className="chamado-group">
                      <label>Nome / Razão social</label>
                      <input
                        type="text"
                        value={clienteNome}
                        onChange={(e) => setClienteNome(e.target.value)}
                      />
                    </div>

                    <div className="chamado-group">
                      <label>CNPJ / CPF</label>
                      <input
                        type="text"
                        value={clienteDocumento}
                        onChange={(e) => setClienteDocumento(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* CARGA */}
                  <h3 className="chamado-section-title text-white">
                    Dados da carga
                  </h3>

                  <div className="chamado-group">
                    <label>Descrição da mercadoria</label>
                    <input
                      type="text"
                      value={descricaoCarga}
                      onChange={(e) => setDescricaoCarga(e.target.value)}
                      placeholder="Ex: Peças automotivas, paletizadas"
                    />
                  </div>

                  <div className="chamado-row">
                    <div className="chamado-group">
                      <label>Peso bruto (kg)</label>
                      <input
                        type="number"
                        value={pesoBruto}
                        onChange={(e) => setPesoBruto(e.target.value)}
                      />
                    </div>

                    <div className="chamado-group">
                      <label>Volume / cubagem (m³)</label>
                      <input
                        type="number"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                      />
                    </div>

                    <div className="chamado-group">
                      <label>Quantidade de volumes</label>
                      <input
                        type="number"
                        value={qtdVolumes}
                        onChange={(e) => setQtdVolumes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="chamado-row">
                    <div className="chamado-group">
                      <label>Valor da mercadoria (R$)</label>
                      <input
                        type="number"
                        value={valorMercadoria}
                        onChange={(e) => setValorMercadoria(e.target.value)}
                      />
                    </div>

                    <div className="chamado-group">
                      <label>Natureza da carga</label>
                      <select
                        value={naturezaCarga}
                        onChange={(e) => setNaturezaCarga(e.target.value)}
                      >
                        <option value="">Selecione</option>
                        <option value="Normal">Normal</option>
                        <option value="Fragil">Frágil</option>
                        <option value="Perecivel">Perecível</option>
                        <option value="Perigosa">Perigosa</option>
                      </select>
                    </div>
                  </div>

                  {/* FISCAL */}
                  <h3 className="chamado-section-title text-white">
                    Dados fiscais
                  </h3>

                  <div className="chamado-row">
                    <div className="chamado-group">
                      <label>Número da NF-e</label>
                      <input
                        type="text"
                        value={numeroNfe}
                        onChange={(e) => setNumeroNfe(e.target.value)}
                      />
                    </div>

                    <div className="chamado-group">
                      <label>Número do CT-e</label>
                      <input
                        type="text"
                        value={numeroCte}
                        onChange={(e) => setNumeroCte(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
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
