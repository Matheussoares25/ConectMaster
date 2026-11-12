import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;
    
class Api {
    static async CallEndpoint(setor, method, body = null, id = null) {

        try {
            const token = localStorage.getItem('token');

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (body !== null) {
                options.body = JSON.stringify(body);
            }

            let url = `${API_URL}/${setor}`;


            if (id !== null) {
                url += `/${id}`;
            }
            const response = await fetch(url, options);

            if (response.status === 400) {
                const erro = await response.json();
                throw new Error(`Erro ${response.status}: ${erro.message}`);
            }


            if (response.status === 204) {
                return null;
            }
            if (response.status === 403) {
                let erro = {};

                try {
                    erro = await response.json();
                } catch {
                   
                }

                if (erro?.message?.includes('Nenhuma licença atribuída ao usuário.')) {
                    throw new Error('Você não possui uma licença ativa.');
                }

                throw new Error(
                    erro?.message || 'Você não tem permissão para realizar esta operação.'
                );
            }
            if (response.status === 404) {
                throw new Error('Usaurio não cadastrado');
            }

            if (!response.ok) {
                const erro = await response.json();

                if (erro.message.includes('aceite os Termos para prosseguir')) {
                    return {
                        termosPendentes: true,
                        mensagem: erro.message
                    };
                }

                if (response.status == 401) {
                    throw new Error('Senha ou login incorretos.');
                }

                if (response.status === 401) {
                    throw new Error('Sua sessão expirou, faca login novamente.');
                }

            }

            return await response.json();
        } catch (error) {
            if(error.message === 'Failed to fetch') {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.');
            }
            throw new Error(error.message);
        }
    }

}

export default Api;