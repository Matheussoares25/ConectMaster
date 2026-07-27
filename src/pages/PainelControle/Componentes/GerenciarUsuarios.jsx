// src/pages/PainelControle/sections/GerenciarUsuarios.jsx
import React, { useEffect, useState } from "react";
import Api from "../../../Services/EndPoint";
import Swal from "sweetalert2";
import "../css/GerenciarUsuario.css";

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [usuarioAberto, setUsuarioAberto] = useState(null);

  const toggleViews = (id) => {
    setUsuarioAberto(usuarioAberto === id ? null : id);
  };

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    ramal: "",
    telefone: "",
    setor: "",
    perfilId: "",
  });

  // ===== CARREGA USUÁRIOS E PERFIS =====
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);

    try {
      const [dataUsuarios, dataPerfis] = await Promise.all([
        Api.CallEndpoint("usuarios", "GET"),
        Api.CallEndpoint("perfis", "GET"),
      ]);

      setUsuarios(dataUsuarios?.usuarios || []);
      setPerfis(dataPerfis?.perfis || dataPerfis || []);
      console.log(perfis);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível carregar os dados. Tente novamente.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } finally {
      setCarregando(false);
    }
  };

  // ===== FORM DE NOVO USUÁRIO =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const limparForm = () => {
    setForm({
      nome: "",
      email: "",
      senha: "",
      ramal: "",
      telefone: "",
      setor: "",
      perfilId: "",
    });
  };

  // ========= CADASTRAR NOVO USUÁRIO ========
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome || !form.email || !form.senha || !form.perfilId) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha nome, e-mail, senha e perfil antes de continuar.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      return;
    }

    setSalvando(true);
    try {
      await Api.CallEndpoint("usuarios", "POST", form);

      Swal.fire({
        icon: "success",
        title: "Usuário cadastrado!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
        timer: 1800,
        showConfirmButton: false,
      });

      limparForm();
      carregarDados();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível cadastrar o usuário.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } finally {
      setSalvando(false);
    }
  };

  // ===== EXCLUIR USUÁRIO =====
  const handleExcluir = async (usuario) => {
    const confirmacao = await Swal.fire({
      icon: "warning",
      title: "Excluir usuário?",
      text: `Tem certeza que deseja excluir "${usuario.nome}"? Essa ação não pode ser desfeita.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#ef5da8",
      cancelButtonColor: "#2a2f45",
    });

    if (!confirmacao.isConfirmed) return;

    try {
      await Api.CallEndpoint(`usuarios/${usuario.id}`, "DELETE");

      Swal.fire({
        icon: "success",
        title: "Usuário excluído!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
        timer: 1500,
        showConfirmButton: false,
      });

      setUsuarios((prev) => prev.filter((u) => u?.id !== usuario.id));
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível excluir o usuário.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    }
  };

  // ===== EDITAR USUÁRIO (SWAL COM FORMULÁRIO) =====
  const handleEditar = async (usuario) => {
    const opcoesPerfis = perfis
      .map(
        (p) =>
          `<option value="${p.id}" ${
            p.id === usuario.perfilId ? "selected" : ""
          }>${p.name}</option>`,
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Editar usuário",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#2f6fed",
      cancelButtonColor: "#2a2f45",
      showCancelButton: true,
      confirmButtonText: "Salvar alterações",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      html: `
        <div class="swal-form">
          <label class="swal-label">Nome</label>
          <input id="swal-nome" class="swal2-input swal-input" value="${
            usuario.nome || ""
          }" placeholder="Nome completo">

          <label class="swal-label">E-mail</label>
          <input id="swal-email" class="swal2-input swal-input" value="${
            usuario.email || ""
          }" placeholder="E-mail">

          <label class="swal-label">Nova senha (deixe em branco para manter)</label>
          <input id="swal-senha" type="password" class="swal2-input swal-input" value="${
            usuario.senha || ""
          }" placeholder="Nova senha">

          <label class="swal-label">Ramal</label>
          <input id="swal-ramal" class="swal2-input swal-input" value="${
            usuario.ramal || ""
          }" placeholder="Ramal">

          <label class="swal-label">Telefone</label>
          <input id="swal-telefone" class="swal2-input swal-input" value="${
            usuario.telefone || ""
          }" placeholder="Telefone">

          <label class="swal-label">Setor</label>
          <input id="swal-setor" class="swal2-input swal-input" value="${
            usuario.setor || ""
          }" placeholder="Setor">

          <label class="swal-label">Permissão</label>
          <select id="swal-perfil" class="swal2-select swal-input">
            ${opcoesPerfis}
          </select>
        </div>
      `,
      preConfirm: () => {
        const nome = document.getElementById("swal-nome").value.trim();
        const email = document.getElementById("swal-email").value.trim();
        const senha = document.getElementById("swal-senha").value;
        const ramal = document.getElementById("swal-ramal").value.trim();
        const telefone = document.getElementById("swal-telefone").value.trim();
        const setor = document.getElementById("swal-setor").value.trim();
        const perfilId = document.getElementById("swal-perfil").value;

        if (!nome || !email || !perfilId) {
          Swal.showValidationMessage(
            "Nome, e-mail e permissão são obrigatórios.",
          );
          return false;
        }

        return { nome, email, senha, ramal, telefone, setor, perfilId };
      },
    });

    if (!formValues) return;

    try {
      const payload = { ...formValues };
      if (!payload.senha) delete payload.senha;
      await Api.CallEndpoint(`usuarios`, "PUT", payload, usuario.id);

      Swal.fire({
        icon: "success",
        title: "Usuário atualizado!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
        timer: 1500,
        showConfirmButton: false,
      });

      carregarDados();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message,
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    }
  };

  const nomePerfil = (perfilId) => {
    const perfil = perfis.find((p) => p.id === perfilId);
    return perfil?.nome || "—";
  };

  //Filtro//
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const bateTexto =
      !filtroTexto ||
      usuario.nome?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      usuario.setor?.toLowerCase().includes(filtroTexto.toLowerCase());

    const batePerfil = !filtroPerfil || usuario.perfil?.name === filtroPerfil;

    return bateTexto && batePerfil;
  });

  // ===== ADICIONAR PERMISSÃO AO USUARIO =========
  const addpermissao = async () => {
    const permissoes = await Api.CallEndpoint(`views`, "GET");

    const usuario = usuariosFiltrados.find((u) => u.id === usuarioAberto);

    const viewsAssociadas = usuario?.views || [];

    const viewsNaoAssociadas = permissoes.filter(
      (p) => !viewsAssociadas.some((v) => v.viewId === p.id),
    );

    Swal.fire({
      icon: "question",
      title: "Selecione uma permissão",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#2f6fed",
      showCancelButton: true,
      showConfirmButton: true,
      html: `
    <select class="form-select" id="permissao">
      ${viewsNaoAssociadas
        .map(
          (p) => `
            <option value="${p?.id}">
              ${p?.name}
            </option>
          `,
        )
        .join("")}
    </select>
  `,
      preConfirm: () => {
        return document.getElementById("permissao").value;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Api.CallEndpoint("usuarioview", "POST", {
            UsuarioId: usuarioAberto,
            ViewId: Number(result.value),
          });
          Swal.fire({
            icon: "success",
            title: "Permissão vinculada!",
            background: "#141826",
            color: "#fff",
            confirmButtonColor: "#2f6fed",
            timer: 1500,
            showConfirmButton: false,
          });
          carregarDados();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro ao vincular permissão",
            background: "#141826",
            color: "#fff",
            confirmButtonColor: "#2f6fed",
            text: error.message,
          });
        }
      }
    });
  };
  const removeView = async (id) => {
    console.log(id, usuarioAberto);
    try {
      console.log(id, usuarioAberto);
      await Api.CallEndpoint("usuarioview", "DELETE", usuarioAberto, id);

      carregarDados();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao remover view",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
        text: error.message,
      });
    }
  };

  return (
    <div className="gerenciar-usuarios">
      <h2 className="h4 fw-bold mb-1 gu-text-primary">Gerenciar Usuários</h2>
      <p className="gu-text-muted mb-4">
        Cadastre, edite ou remova usuários do sistema.
      </p>

      {/* ===== FORMULÁRIO DE NOVO USUÁRIO ===== */}
      <form className="gu-card p-4 mb-4" onSubmit={handleSubmit}>
        <h3 className="h6 fw-semibold mb-3 gu-text-primary">Novo usuário</h3>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label gu-label">Nome</label>
            <input
              type="text"
              name="nome"
              className="form-control gu-input"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label gu-label">E-mail</label>
            <input
              type="email"
              name="email"
              className="form-control gu-input"
              placeholder="email@empresa.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label gu-label">Senha</label>
            <input
              type="password"
              name="senha"
              className="form-control gu-input"
              placeholder="••••••••"
              value={form.senha}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label gu-label">Permissão</label>
            <select
              name="perfilId"
              className="form-select gu-input"
              value={form.perfilId}
              onChange={handleChange}
            >
              <option value="">Selecione um perfil</option>
              {perfis.map((perfil) => (
                <option
                  key={perfil.id}
                  value={perfil.id}
                  className="text-black"
                >
                  {perfil.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label gu-label">Ramal</label>
            <input
              type="text"
              name="ramal"
              className="form-control gu-input"
              placeholder="Ex: 1234"
              value={form.ramal}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label gu-label">Telefone</label>
            <input
              type="text"
              name="telefone"
              className="form-control gu-input"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label gu-label">Setor</label>
            <input
              type="text"
              name="setor"
              className="form-control gu-input"
              placeholder="Ex: Suporte"
              value={form.setor}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button
            type="submit"
            className="btn gu-btn-primary"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Cadastrar usuário"}
          </button>
        </div>
      </form>

      {/* ===== LISTA DE USUÁRIOS ===== */}
      <div className="gu-card p-4">
        <h3 className="h6 fw-semibold mb-3 gu-text-primary">
          Usuários cadastrados
        </h3>

        {/* ===== FILTROS ===== */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-8">
            <input
              type="text"
              className="form-control gu-input"
              placeholder="Buscar por nome, e-mail ou setor..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select gu-input"
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value)}
            >
              <option value="">Todas as permissões</option>
              {perfis.map((perfil) => (
                <option key={perfil.id} value={perfil.name}>
                  {perfil.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {carregando ? (
          <p className="gu-text-muted mb-0">Carregando usuários...</p>
        ) : usuariosFiltrados.length === 0 ? (
          <p className="gu-text-muted mb-0">Nenhum usuário encontrado.</p>
        ) : (
          <div className="table-responsive">
            <table className="table gu-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Setor</th>
                  <th>Ramal</th>
                  <th>Permissão</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <React.Fragment key={usuario.id}>
                    <tr>
                      <td>{usuario?.nome}</td>
                      <td>{usuario?.email}</td>
                      <td>{usuario?.setor || "—"}</td>
                      <td>{usuario?.ramal || "—"}</td>
                      <td>
                        <span className="gu-badge">
                          {usuario?.perfil?.name}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm gu-btn-icon"
                            title="Ver permissões de visualização"
                            onClick={() => toggleViews(usuario.id)}
                          >
                            👁
                          </button>
                          <button
                            className="btn btn-sm gu-btn-icon"
                            title="Editar"
                            onClick={() => handleEditar(usuario)}
                          >
                            ✎
                          </button>
                          <button
                            className="btn btn-sm gu-btn-icon gu-btn-icon--danger"
                            title="Excluir"
                            onClick={() => handleExcluir(usuario)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ===== LINHA EXPANSÍVEL COM AS VIEWS ===== */}
                    <tr>
                      <td colSpan="6" className="p-0 border-0">
                        <div
                          className={`collapse ${
                            usuarioAberto === usuario.id ? "show" : ""
                          }`}
                        >
                          <div className="p-3 gu-collapse-panel">
                            <h6
                              className="gu-text-primary mb-2"
                              style={{ fontSize: 13 }}
                            >
                              Páginas visíveis para{" "}
                              <strong>{usuario.nome}</strong>
                            </h6>
                            {usuario?.views?.length > 0 ? (
                              <div className="d-flex flex-wrap gap-2">
                                {usuario.views.map((view, index) => (
                                  <span
                                    key={index}
                                    className="badge text-bg-primary"
                                    onDoubleClick={() => {
                                      console.log(view.viewId),
                                        removeView(view.viewId);
                                    }}
                                  >
                                    {view.name || view}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="gu-text-muted">
                                Nenhuma página vinculada ao perfil deste
                                usuário.
                              </span>
                            )}
                            <span className="text-muted">
                              Nenhuma permissão vinculada.
                              <button
                                className="btn btn-sm btn-dark"
                                onClick={() => addpermissao()}
                              >
                                + Permitir visualizar novas paginas
                              </button>
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
