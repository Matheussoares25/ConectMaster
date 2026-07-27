import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Api from "../../../Services/EndPoint";
import { useNavigate } from "react-router-dom";

export default function FormularioChamado() {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState(1);
  const [descricao, setDescricao] = useState("");
  const [setor, setSetor] = useState(JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"))?.setor || "");
  const [email, setEmail] = useState(
    JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"))
      ?.email || "",
  );

  const abrirChamado = async (e) => {
    e.preventDefault();

    if (!titulo || !descricao || !categoria) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha todos os campos.",
      });
      return;
    }

    try {
      await Api.CallEndpoint("Chamados", "POST", {
        titulo,
        descricao,
        Prioridade: Number(prioridade),
        categoria,
        setor,
        email,
        status: "Aberto",
      });

      Swal.fire({
        icon: "success",
        title: "Chamado aberto",
        text: "Seu chamado foi registrado com sucesso.",
      });

      setTitulo("");
      setDescricao("");
      setPrioridade("Baixa");
      setCategoria("");
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
              <label>Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Computador não liga"
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
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Rede">Rede</option>
                  <option value="Impressora">Impressora</option>
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

            <div className="chamado-group">
              <label>Descrição</label>
              <textarea
                rows="6"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o problema detalhadamente..."
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


