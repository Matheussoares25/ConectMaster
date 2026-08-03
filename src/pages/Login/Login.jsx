// src/pages/Login.jsx
import React, { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

//services
import Api from "../../Services/AuthPoint";

//css
import "./css/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarlogin, setlembrarlogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Preencha todos os campos.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      return;
    }

    try {
      const resposta = await Api.CallEndpoint("LoginCad/login", "POST", {
        email,
        senha,
      });

      const lembrarDeMim = document.getElementById("lembrarDeMim").checked;
      console.log("lembrarDeMim:", lembrarDeMim);

      const storage = lembrarDeMim ? localStorage : sessionStorage;

      if (lembrarDeMim) {
        localStorage.setItem("lembrarDeMim", "true");
      } else {
        localStorage.removeItem("lembrarDeMim");
      } 

      localStorage.setItem("views",  JSON.stringify(resposta.user.views));
      storage.setItem("token", resposta.token); 
      storage.setItem("user", JSON.stringify(resposta.user));

      Swal.fire({
        icon: "success",
        title: "Bem-vindo!",
        text: "Login realizado com sucesso.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
        timer: 2000,
      }).then(() => {
        navigate("/Home");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao fazer login.",
        text: error.message,
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    }
  };

        useEffect(() => {
        const lembrarDeMim = localStorage.getItem("lembrarDeMim");
        if (lembrarDeMim) {
          document.getElementById("lembrarDeMim").checked = true;
          const email = JSON.parse(localStorage.getItem("user")).email;
          setEmail(email);
        }
      }, []);

  return (
 <div className="auth-page-simples">
      <div className="auth-card-simples">
        <div className="auth-logo-simples">
          <div className="auth-logo-mark-simples">
            ConectMaster
          </div>
        </div>

        <h2 className="auth-form-title">Acessar conta</h2>

        <p className="auth-form-subtitle">
          Informe suas credenciais para continuar
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label className="input-label">E-mail</label>
            <input
              className="auth-input"
              type="email"
              placeholder="nome@empresa.com"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <label className="input-label">Senha</label>

              <a
                href="#"
                className="forgot-link"
                onClick={(e) => e.preventDefault()}
              >
                Esqueci minha senha
              </a>
            </div>

            <div className="password-wrapper">
              <input
                className="auth-input"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <label className="checkbox-wrapper">
            <input type="checkbox" id="lembrarDeMim" />
            <span>Manter-me conectado por 30 dias</span>
          </label>

          <button type="submit" className="auth-button">
            Entrar
          </button>
        </form>

        <p className="signup-text">
          Não tem uma conta?{' '}
          <a
            href="#"
            className="signup-link"
            onClick={(e) => e.preventDefault()}
          >
            Solicitar ao Time de TI
          </a>
        </p>
      </div>
    </div>
  );
}
