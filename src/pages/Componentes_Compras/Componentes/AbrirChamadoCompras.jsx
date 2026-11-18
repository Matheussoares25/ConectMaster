import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Api from "../../../Services/EndPoint";
import MeusChamadosCompras from "./MeusChamadosCompras";
import "../css/comprasChamados.css";

export default function AbrirChamadoCompras() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeId, setActiveId] = useState("abrir");
  const [salvando, setSalvando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState(1);
  const [descricao, setDescricao] = useState("");
  const [setor, setSetor] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");
    setUser(storedUser || {});
    setEmail(storedUser?.email || "");
    setSetor(storedUser?.departamentoNome || "");
  }, []);

  const abrirChamado = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !descricao.trim() || !categoria) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha título, categoria e descrição.",
      });
      return;
    }

    setSalvando(true);
    try {
      await Api.CallEndpoint("ChamadosCompras", "POST", {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        Prioridade: Number(prioridade),
        categoria,
        setor,
        email,
        status: "Aberto",
        tipoChamadoId: 2,
      });

      await Swal.fire({
        icon: "success",
        title: "Chamado aberto",
        text: "Seu chamado foi enviado para a equipe de Compras.",
      });

      setTitulo("");
      setCategoria("");
      setPrioridade(1);
      setDescricao("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível abrir o chamado.",
      });
    } finally {
      setSalvando(false);
    }
  };

  const formularioChamado = (
    <div className="compras-chamados">
      <div className="compras-chamados__header">
        <h1>Abrir chamado de Compras</h1>
        <p>Registre uma nova solicitação para a equipe de Compras.</p>
      </div>

      <div className="chamado-card">
        <form onSubmit={abrirChamado}>
          <div className="chamado-group">
            <label htmlFor="compras-titulo">Título</label>
            <input
              id="compras-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Solicitação de cotação"
              maxLength={150}
              required
            />
          </div>

          <div className="chamado-row">
            <div className="chamado-group">
              <label htmlFor="compras-email">Email do solicitante</label>
              <input
                id="compras-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="chamado-group">
              <label htmlFor="compras-setor">Setor</label>
              <input
                id="compras-setor"
                type="text"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
              />
            </div>
          </div>

          <div className="chamado-row">
            <div className="chamado-group">
              <label htmlFor="compras-categoria">Categoria</label>
              <select
                id="compras-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="Compra">Compra</option>
                <option value="Cotação">Cotação</option>
                <option value="Fornecedor">Fornecedor</option>
                <option value="Pedido">Pedido</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="chamado-group">
              <label htmlFor="compras-prioridade">Prioridade</label>
              <select
                id="compras-prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(Number(e.target.value))}
              >
                <option value={1}>Baixa</option>
                <option value={2}>Média</option>
                <option value={3}>Alta</option>
                <option value={4}>Crítica</option>
              </select>
            </div>
          </div>

          <div className="chamado-group">
            <label htmlFor="compras-descricao">Descrição</label>
            <textarea
              id="compras-descricao"
              rows="6"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva sua solicitação..."
              required
            />
          </div>

          <button
            type="submit"
            className="chamado-button"
            disabled={salvando}
          >
            {salvando ? "Enviando..." : "Abrir chamado"}
          </button>
        </form>
      </div>
    </div>
  );

  const menuItems = [
    { id: "abrir", title: "Abrir chamado", icon: "＋" },
    { id: "meusChamados", title: "Meus chamados", icon: "◷" },
  ];

  return (
    <div className="panel-wrapper" data-bs-theme="dark">
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        <aside className="home-sidebar">
          <div>
            <div className="d-flex align-items-center gap-2 mb-4 px-1">
              <button
                className="btn btn-sm panel-back-btn d-flex align-items-center justify-content-center"
                onClick={() => navigate("/home")}
              >
                ←
              </button>
              <div className="panel-logo-mark d-flex align-items-center justify-content-center fw-bold">
                C
              </div>
              <span className="home-logo-text">ConectMaster</span>
            </div>

            <ul className="nav nav-pills flex-column gap-1">
              {menuItems.map((item) => (
                <li className="nav-item" key={item.id}>
                  <button
                    className={`nav-link w-100 text-start d-flex align-items-center gap-2 panel-nav-link ${
                      activeId === item.id ? "active" : ""
                    }`}
                    onClick={() => setActiveId(item.id)}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="d-flex align-items-center gap-2 pt-3 border-top border-secondary-subtle">
            <div className="panel-user-avatar d-flex align-items-center justify-content-center fw-semibold">
              {user?.nome?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="d-flex flex-column overflow-hidden">
              <span className="small fw-semibold text-truncate">
                {user?.nome || "Usuário"}
              </span>
              <span className="text-muted" style={{ fontSize: "11px" }}>
                {user?.perfil}
              </span>
            </div>
          </div>
        </aside>

        <main className="flex-grow-1 panel-content">
          {activeId === "abrir" ? (
            formularioChamado
          ) : (
            <div className="compras-chamados">
              <MeusChamadosCompras />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
