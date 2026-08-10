// src/pages/PainelControle/Componentes/Configuracoes.jsx
import React, { useEffect, useState } from 'react';
import Api from '../../../services/EndPoint';
import Swal from 'sweetalert2';
import '../css/Configuracoes.css';

export default function Configuracoes() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    nomeEmpresa: '',
    emailSuporte: '',
    tempoLimiteChamado: '',
    notificarPorEmail: true,
    notificarNovoChamado: true,
    notificarMudancaStatus: true,
    exigirAprovacaoOS: false,
    permitirCadastroAutomatico: false,
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    setCarregando(true);
    try {
      const response = await Api.CallEndpoint('Configuracoes', 'GET');
      if (response) {
        setForm((prev) => ({ ...prev, ...response }));
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível carregar as configurações.',
        background: '#141826',
        color: '#fff',
        confirmButtonColor: '#2f6fed',
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (campo) => {
    setForm((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await Api.CallEndpoint('Configuracoes', 'PUT', form);

      Swal.fire({
        icon: 'success',
        title: 'Configurações salvas!',
        background: '#141826',
        color: '#fff',
        confirmButtonColor: '#2f6fed',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.message || 'Não foi possível salvar as configurações.',
        background: '#141826',
        color: '#fff',
        confirmButtonColor: '#2f6fed',
      });
    } finally {
      setSalvando(false);
    }
  };

}