import Swal from "sweetalert2";

class Api {
  static async CallEndpoint(setor, method, body = null, id = null) {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    let url = `https://conectapi-a7a5grfdbpfzhhcv.westus3-01.azurewebsites.net/api/${setor}`;
    // let url = `https://localhost:7029/api/${setor}`;
    if (id !== null) {
      url += `/${id}`;
    }

    try {
      window.dispatchEvent(new Event("loading:start"));

      const response = await fetch(url, options);

      if (response.status === 204) {
        return null;
      }

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        window.dispatchEvent(new Event("auth:expired"));

        swal.fire({
          icon: "error",
          title: "Sessão expirada",
          text: "Sua sessão expirou. Faça login novamente.",
          timeout: 5000,
        });

        const err = new Error("Sessão expirada. Faça login novamente.");
        err.status = 401;
        throw err;
      }

      if (response.status === 400) {
        let mensagem = data?.message || data?.error;

        if (!mensagem && data?.errors) {
          mensagem = Object.values(data.errors).flat().join(" ");
        }

        const err = new Error(mensagem || data?.title || "Erro de validação.");
        err.status = 400;
        throw err;
      }

      if (!response.ok) {
        const padrao = {
          403: "Você não tem permissão para realizar esta operação.",
          404: "Registro não encontrado.",
          409: "Conflito ao salvar registro.",
        };

        const err = new Error(
          data?.message ||
            data?.error ||
            data?.title ||
            padrao[response.status] ||
            "Erro ao processar solicitação."
        );
        err.status = response.status;
        throw err;
      }

      return data;
    } finally {
      window.dispatchEvent(new Event("loading:end"));
    }
  }
}

export default Api;