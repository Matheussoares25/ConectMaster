// src/pages/PainelControle/sections/GerenciarUsuarios.jsx
import React, { useEffect, useState } from "react";
import Api from "../../../../../Services/EndPoint";
import Swal from "sweetalert2";
const swalBase = {
  background: "#141826",
  color: "#fff",
  confirmButtonColor: "#2f6fed",
  cancelButtonColor: "#2a2f45",
};

const escapeHtml = (texto = "") =>
  String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formInicial = {
  nome: "",
  email: "",
  senha: "",
  ramal: "",
  telefone: "",
  departamentoId: "",
  perfilId: "",
};

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [usuarioAberto, setUsuarioAberto] = useState(null);
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    carregarDados();
  }, []);

  // ===== CARREGAR =====
  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [dataPerfis, dataUsuarios, dataViews, dataDepartamentos] =
        await Promise.all([
          Api.CallEndpoint("perfis", "GET"),
          Api.CallEndpoint("usuarios", "GET"),
          Api.CallEndpoint("UsuarioView", "GET"),
          Api.CallEndpoint("departamentos", "GET"),
        ]);

      const listaUsuarios = Array.isArray(dataUsuarios)
        ? dataUsuarios
        : dataUsuarios?.usuarios || [];

      const listaViews = Array.isArray(dataViews) ? dataViews : [];

      // agrupa as views de cada usuário
      const viewsPorUsuario = listaViews.reduce((acc, uv) => {
        (acc[uv.usuarioId] ||= []).push({
          id: uv.id,
          viewId: uv.viewId,
          name: uv.viewNome,
        });
        return acc;
      }, {});

      setUsuarios(
        listaUsuarios.map((u) => ({
          ...u,
          views: viewsPorUsuario[u.id] || [],
        })),
      );
      setPerfis(dataPerfis?.perfis || dataPerfis || []);
      setDepartamentos(
        dataDepartamentos?.departamentos || dataDepartamentos || [],
      );
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível carregar os dados.",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome || !form.email || !form.senha || !form.perfilId) {
      Swal.fire({
        ...swalBase,
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha nome, e-mail, senha e perfil antes de continuar.",
      });
      return;
    }

    setSalvando(true);
    try {
      await Api.CallEndpoint("usuarios", "POST", {
        ...form,
        perfilId: Number(form.perfilId),
        departamentoId: form.departamentoId
          ? Number(form.departamentoId)
          : null,
      });

      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Usuário cadastrado!",
        timer: 1800,
        showConfirmButton: false,
      });

      setForm(formInicial);
      carregarDados();
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível cadastrar o usuário.",
      });
    } finally {
      setSalvando(false);
    }
  };

  // ===== EDITAR USUÁRIO =====
  const handleEditar = async (usuario) => {
    const opcoesPerfis = perfis
      .map(
        (p) =>
          `<option value="${p.id}" ${
            p.id === usuario.perfilId ? "selected" : ""
          }>${escapeHtml(p.name)}</option>`,
      )
      .join("");

    const opcoesDepartamentos = departamentos
      .map(
        (d) =>
          `<option value="${d.id}" ${
            d.id === usuario.departamentoId ? "selected" : ""
          }>${escapeHtml(d.nome)}</option>`,
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      ...swalBase,
      title: "Editar usuário",
      showCancelButton: true,
      confirmButtonText: "Salvar alterações",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      html: `
        <div class="swal-form">
          <label class="swal-label">Nome</label>
          <input id="swal-nome" class="swal2-input swal-input"
            value="${escapeHtml(usuario.nome)}" placeholder="Nome completo">

          <label class="swal-label">E-mail</label>
          <input id="swal-email" class="swal2-input swal-input"
            value="${escapeHtml(usuario.email)}" placeholder="E-mail">

          <label class="swal-label">Nova senha (deixe em branco para manter)</label>
          <input id="swal-senha" type="password" class="swal2-input swal-input"
            placeholder="Nova senha">

          <label class="swal-label">Ramal</label>
          <input id="swal-ramal" class="swal2-input swal-input"
            value="${escapeHtml(usuario.ramal)}" placeholder="Ramal">

          <label class="swal-label">Telefone</label>
          <input id="swal-telefone" class="swal2-input swal-input"
            value="${escapeHtml(usuario.telefone)}" placeholder="Telefone">

          <label class="swal-label">Departamento</label>
          <select id="swal-departamento" class="form-select">
            <option value="">Nenhum</option>
            ${opcoesDepartamentos}
          </select>

          <label class="swal-label">Permissão</label>
          <select id="swal-perfil" class="form-select">
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
        const departamentoId =
          document.getElementById("swal-departamento").value;
        const perfilId = document.getElementById("swal-perfil").value;

        if (!nome || !email || !perfilId) {
          Swal.showValidationMessage(
            "Nome, e-mail e permissão são obrigatórios.",
          );
          return false;
        }

        return {
          nome,
          email,
          senha: senha || undefined, // undefined não vai no JSON
          ramal: ramal || null,
          telefone: telefone || null,
          departamentoId: departamentoId ? Number(departamentoId) : null,
          perfilId: Number(perfilId),
        };
      },
    });

    if (!formValues) return;

    try {
      await Api.CallEndpoint("usuarios", "PUT", formValues, usuario.id);

      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Usuário atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });

      carregarDados();
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível atualizar o usuário.",
      });
    }
  };

  // ===== EXCLUIR USUÁRIO =====
  const handleExcluir = async (usuario) => {
    const confirmacao = await Swal.fire({
      ...swalBase,
      icon: "warning",
      title: "Excluir usuário?",
      text: `Tem certeza que deseja excluir "${usuario.nome}"? Essa ação não pode ser desfeita.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef5da8",
    });

    if (!confirmacao.isConfirmed) return;

    try {
      await Api.CallEndpoint("usuarios", "DELETE", null, usuario.id);

      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Usuário excluído!",
        timer: 1500,
        showConfirmButton: false,
      });

      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível excluir o usuário.",
      });
    }
  };

  // ===== VIEWS DO USUÁRIO =====
  const toggleViews = (id) => {
    setUsuarioAberto((atual) => (atual === id ? null : id));
  };

  const addPermissao = async () => {
    const todasViews = await Api.CallEndpoint("views", "GET");
    const usuario = usuarios.find((u) => u.id === usuarioAberto);
    const jaVinculadas = (usuario?.views || []).map((v) => v.viewId);

    const disponiveis = todasViews.filter((v) => !jaVinculadas.includes(v.id));

    if (disponiveis.length === 0) {
      Swal.fire({
        ...swalBase,
        icon: "info",
        title: "Nenhuma página disponível.",
      });
      return;
    }

    const { value: viewId } = await Swal.fire({
      ...swalBase,
      icon: "question",
      title: "Selecione uma página",
      showCancelButton: true,
      html: `
        <select id="swal-view" class="form-select">
          ${disponiveis
            .map(
              (v) => `<option value="${v.id}">${escapeHtml(v.name)}</option>`,
            )
            .join("")}
        </select>
      `,
      preConfirm: () => document.getElementById("swal-view").value,
    });

    if (!viewId) return;

    try {
      await Api.CallEndpoint("usuarioview", "POST", {
        usuarioId: usuarioAberto,
        viewId: Number(viewId),
      });

      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Página liberada!",
        timer: 1500,
        showConfirmButton: false,
      });

      carregarDados();
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro ao vincular página",
        text: error.message,
      });
    }
  };

  const removeView = async (id) => {
    Swal.fire({
      icon: "warning",
      title: "Excluir permissão?",
      text: `Tem certeza que deseja desvincular essa permissão?.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#ef5da8",
      cancelButtonColor: "#2a2f45",
    }).then(async (result) => {
      if (result.isConfirmed)
        try {
          await Api.CallEndpoint("usuarioview", "DELETE", null, id);
          carregarDados();
        } catch (error) {
          Swal.fire({
            ...swalBase,
            icon: "error",
            title: "Erro ao remover página",
            text: error.message,
          });
        }
    });
  };

  // ===== FILTRO =====
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const busca = filtroTexto.toLowerCase();
    const bateTexto =
      !filtroTexto ||
      usuario.nome?.toLowerCase().includes(busca) ||
      usuario.email?.toLowerCase().includes(busca) ||
      usuario.departamentoNome?.toLowerCase().includes(busca);

    const batePerfil = !filtroPerfil || usuario.perfil?.name === filtroPerfil;

    return bateTexto && batePerfil;
  });

  return (
    <div className="gerenciar-usuarios">
      <h2 className="h4 fw-bold mb-1 gu-text-primary">Gerenciar Usuários</h2>
      <p className="gu-text-muted mb-4">
        Cadastre, edite ou remova usuários do sistema.
      </p>

      {/* ===== FORMULÁRIO ===== */}
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
                <option key={perfil.id} value={perfil.id}>
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
            <label className="form-label gu-label">Departamento</label>
            <select
              name="departamentoId"
              className="form-select gu-input"
              value={form.departamentoId}
              onChange={handleChange}
            >
              <option value="">Selecione um departamento</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
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

      {/* ===== LISTA ===== */}
      <div className="gu-card p-4">
        <h3 className="h6 fw-semibold mb-3 gu-text-primary">
          Usuários cadastrados
        </h3>

        <div className="row g-2 mb-3">
          <div className="col-12 col-md-8">
            <input
              type="text"
              className="form-control gu-input"
              placeholder="Buscar por nome, e-mail ou departamento..."
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
                  <th>Departamento</th>
                  <th>Ramal</th>
                  <th>Permissão</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <React.Fragment key={usuario.id}>
                    <tr>
                      <td>{usuario.nome}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.departamentoNome || "—"}</td>
                      <td>{usuario.ramal || "—"}</td>
                      <td>
                        <span className="gu-badge">
                          {usuario.perfil?.name || "—"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm gu-btn-icon"
                            title="Ver páginas visíveis"
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

                            {usuario.views.length > 0 ? (
                              <div className="d-flex flex-wrap gap-2 mb-2">
                                {usuario.views.map((view) => (
                                  <span
                                    key={view.id}
                                    className="badge text-bg-primary"
                                    title="Duplo clique para remover"
                                    onDoubleClick={() => removeView(view.id)}
                                  >
                                    {view.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="gu-text-muted d-block mb-2">
                                Nenhuma página liberada para este usuário.
                              </span>
                            )}

                            <button
                              className="btn btn-sm btn-dark"
                              onClick={addPermissao}
                            >
                              + Liberar página
                            </button>
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
