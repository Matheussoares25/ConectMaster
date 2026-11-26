// src/pages/PainelControle/Componentes/CotacaoMoeda.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import "../css/buscaMoedas.css";

const moedas = [
  { codigo: "USD", nome: "Dólar Americano" },
  { codigo: "EUR", nome: "Euro" },
  { codigo: "GBP", nome: "Libra Esterlina" },
  { codigo: "ARS", nome: "Peso Argentino" },
  { codigo: "BTC", nome: "Bitcoin" },
  { codigo: "CAD", nome: "Dólar Canadense" },
  { codigo: "JPY", nome: "Iene Japonês" },
];

export default function CotacaoMoeda() {
  const [moeda, setMoeda] = useState("USD");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [cotacoes, setCotacoes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [buscou, setBuscou] = useState(false);

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const periodos = [
    {
      id: 1,
      nome: "5 dias",
      dias: 5,
    },
    {
      id: 2,
      nome: "7 dias",
      dias: 7,
    },
    {
      id: 3,
      nome: "15 dias",
      dias: 15,
    }
  ];

  const handlePeriodoChange = (e) => {
  const periodoId = Number(e.target.value);

  const novaDataInicio = addDays(new Date(), -periodoId) .toISOString().split("T")[0];

  setDataInicio(novaDataInicio);
  setDataFim(new Date().toISOString().split("T")[0]);

  console.log(novaDataInicio);

  };


  const buscarCotacoes = async (e) => {
    e.preventDefault();

    if (!dataInicio || !dataFim ) {
      Swal.fire({
        icon: "warning",
        title: "Período obrigatório",
        text: "Selecione a data inicial e final do período.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      return;
    }

    if (dataInicio > dataFim) {
      Swal.fire({
        icon: "warning",
        title: "Período inválido",
        text: "A data inicial não pode ser depois da data final.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      return;
    }

    const formatarDataApi = (data) => {
      const [ano, mes, dia] = data.split("-");
      return `${mes}-${dia}-${ano}`;
    };

    setBuscando(true);
    setBuscou(true);

    try {
      const inicioFmt = formatarDataApi(dataInicio);
      const fimFmt = formatarDataApi(dataFim);

      const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda='${moeda}',dataInicial='${inicioFmt}',dataFinalCotacao='${fimFmt}')?$filter=tipoBoletim eq 'Fechamento'&$format=json`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Falha ao consultar a cotação.");

      const data = await response.json();
      setCotacoes(data.value);
      console.log(cotacoes);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível buscar as cotações. Tente novamente.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      setCotacoes([]);
    } finally {
      setBuscando(false);
    }
  };

  const formatarDataExibicao = (timestamp) => {
    return new Date(timestamp.replace(" ", "T")).toLocaleString("pt-BR");
  };

  const formatarValor = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });

  const moedaSelecionada = moedas.find((m) => m.codigo === moeda);
  return (
    <div className="cb-wrapper">
      <header className="cb-page-header mb-4">
        <span className="cb-eyebrow">Câmbio</span>
        <h2 className="h4 fw-bold mb-1 cb-text-primary">Cotação de Moedas</h2>
        <p className="cb-text-muted mb-0">
          Consulte o histórico de compra e venda de moedas por período.
        </p>
      </header>

      {/* ===== FILTROS DE BUSCA ===== */}
      <div className="cb-card p-4 mb-4">
        <form onSubmit={buscarCotacoes}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label cb-label" htmlFor="cb-moeda">Moeda</label>
              <select
                id="cb-moeda"
                className="form-select cb-input"
                value={moeda}
                onChange={(e) => setMoeda(e.target.value)}
              >
                {moedas.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.codigo} — {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label cb-label" htmlFor="cb-data-inicio">Data inicial</label>
              <input
                id="cb-data-inicio"
                type="date"
                className="form-control cb-input"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label cb-label" htmlFor="cb-data-fim">Data final</label>
              <input
                id="cb-data-fim"
                type="date"
                className="form-control cb-input"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label cb-label" htmlFor="cb-periodo">Período rápido</label>
              <select id="cb-periodo" className="form-select cb-input" onChange={handlePeriodoChange} defaultValue="">
                <option value="" disabled>Selecione</option>
                {periodos.map((p) => (
                  <option key={p.id} value={p.dias}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <button
                type="submit"
                className="btn cb-btn-primary w-100"
                disabled={buscando}
              >
                {buscando ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ===== RESULTADO ===== */}
      <div className="cb-card cb-results-card p-4">
        <div className="cb-results-header mb-3">
          <div>
            <span className="cb-eyebrow">Resultado da consulta</span>
            <h3 className="h6 fw-semibold mb-0 cb-text-primary">
              {moedaSelecionada
                ? `${moedaSelecionada.nome} (${moedaSelecionada.codigo}/BRL)`
                : "Resultado"}
            </h3>
          </div>
          {buscou && !buscando && cotacoes.length > 0 && (
            <span className="cb-result-count">
              {cotacoes.length} {cotacoes.length === 1 ? "cotação" : "cotações"}
            </span>
          )}
        </div>

        {!buscou ? (
          <p className="cb-text-muted mb-0">
            Selecione a moeda e o período, depois clique em "Buscar".
          </p>
        ) : buscando ? (
          <p className="cb-text-muted mb-0">Carregando cotações...</p>
        ) : cotacoes.length === 0 ? (
          <p className="cb-text-muted mb-0">
            Nenhuma cotação encontrada para o período selecionado.
          </p>
        ) : (
          <div className="table-responsive cb-table-viewport">
            <table className="table cb-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Compra</th>
                  <th>Venda</th>
                  <th>Variação</th>
                </tr>
              </thead>
              <tbody>
                {cotacoes.map((cot, index) => {
                  const variacao = Number(cot.pctChange);
                  return (
                    <tr key={`${cot.dataHoraCotacao}-${index}`}>
                      <td>{formatarDataExibicao(cot.dataHoraCotacao)}</td>
                      <td>R$ {formatarValor(cot.cotacaoCompra)}</td>
                      <td>R$ {formatarValor(cot.cotacaoVenda)}</td>
                      <td>
                        <span
                          className={`cb-badge ${variacao >= 0 ? "cb-badge--success" : "cb-badge--danger"}`}
                        >
                          {Number.isFinite(variacao)
                            ? `${variacao > 0 ? "+" : ""}${variacao.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`
                            : "—"}
                        </span>
                        <span className="cb-bulletin">{cot.tipoBoletim}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
