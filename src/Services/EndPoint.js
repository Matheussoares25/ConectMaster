import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

class Api {
  static async CallEndpoint(setor, method, body = null, id = null) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

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

    let url = `https://localhost:7029/api/${setor}`;

    

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

      if (response.status === 400) {
        let mensagem = data?.message || data?.error;

        if (!mensagem && data?.errors) {
          mensagem = Object.values(data.errors).flat().join(" ");
        }

        throw new Error(mensagem || data?.title || "Erro de validação.");
      }

      if (response.status === 401) {
        localStorage.clear();

        Swal.fire({
          icon: "error",
          title: "Sessão expirada",
          text: "Faça login novamente.",
          timer: 2000,
        }).then(() => {
          navigate("/");
        })

        return;
      }

      if (response.status === 403) {
        
        throw new Error(
          data?.message ||
            data?.error ||
            "Você não tem permissão para realizar esta operação."
        );
      }

      if (response.status === 404) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Registro não encontrado."
        );
      }

      if (response.status === 409) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Conflito ao salvar registro."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            data?.title ||
            "Erro ao processar solicitação."
        );
      }

      return data;
    } catch (error) {
      
      throw error;
    } finally {
      window.dispatchEvent(new Event("loading:end"));
    }
  }
}

export default Api;