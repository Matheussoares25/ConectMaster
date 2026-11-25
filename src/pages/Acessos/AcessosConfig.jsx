import { icons } from "../../Themes/icons";

export  const menuItems = [
    //administração 
  {
    id: "ordemservico",
     idContent: 1,
    title: "Abrir Serviço",
    description: "Registre um novo serviço solicitado",
    icon: icons.chamado,
    color: "primary",
    route: "/AbrirOrdemServico",
  },
  {
    id: "servicosgeral",
     idContent: 1,
    title: "Histórico de Ordens de Servico",
    description:
      "Consulte ordens de serviço abertas, em andamento ou finalizadas",
    icon: icons.servicos,
    color: "warning",
    route: "/HistoricoOrdemServico",
  },
  {
    id: "painelcontrole",
     idContent: 1,
    title: "Painel de controle",
    description: "Acesse o painel de controle para gerenciar seus chamados",
    icon: icons.paineldecontrole,
    color: "success",
    route: "/painelControle",
  },
  {
    id: "historicostandby",
     idContent: 1,
    title: "Chamados de Compras em standby",
    description: "Consulte chamados de Compras aguardando atendimento",
    icon: icons.chamado,
    color: "danger",
    route: "/chamadoscomprasstandby",
  },
  {
    id: "historicochamadocompras",
      idContent: 1,
    title: "Cadastrar Notícia",
    description: "Cadastre uma nova notícia para o portal",
    icon: icons.noticia,
    color: "primary",
    route: "/CadastrarNoticia",
  },
  //compras
    {
    id: "abrirchamadocompras",
    idContent: 2,
    title: "Abrir chamado de Compras",
    description: "Registre uma nova solicitação para a equipe de Compras",
    icon: icons.compras,
    color: "primary",
    route: "/abrirchamadocompras",
  },
  {
    id: "historicochamados",
    idContent: 2,
    title: "Histórico de chamados de Compras",
    description: "Consulte as solicitações enviadas para a equipe de Compras",
    icon: icons.historico,
    color: "warning",
    route: "/historicochamadoscompras",
  },
  //Ti
    {
    id: "abrirchamado",
    idContent: 3,
    title: "Abrir Chamado",
    description: "Registre um novo chamado de suporte técnico",
    icon: icons.chamado,
    color: "primary",
    route: "/abrirChamado",
  },
  {
    id: "historicochamados",
    idContent: 3,
    title: "Histórico de Chamados",
    description: "Consulte chamados abertos, em andamento ou finalizados",
    icon: icons.historico,
    color: "warning",
    route: "/historicochamados",
  },
  {
    id: "dpmoveis",
    idContent: 3,
    title: "Dp Móveis",
    description: "Cadastre aparelhos e consulte os termos de responsabilidade",
    icon: icons.servicos,
    color: "success",
    route: "/dpmoveis",
  },
  //Menu_one
    {
    id: "abriruber",
    idContent: 4,
    title: "Uber",
    description: "Registros uso Uber",
    icon: icons.uber,
    color: "primary",
    route: "/uber",
  },
  {
    id: "formularios",
    idContent: 4,
    title: "Formulários",
    description: "Acesse os formulários disponíveis para preenchimento",
    icon: icons.servicos,
    color: "primary",
    route: "/formularios",
  },
  //Estoque
  {
     id: "estoque",
    idContent: 5,
    title: "Estoque",
    description: "Acesse o estoque disponível",
    icon: icons.servicos,
    color: "primary",
    route: "/estoque",
  }, 
  //Portaria
  {
    id: "portaria",
    idContent: 6,
    title: "Portaria",
    description: "Acesse o módulo de portaria",
    icon: icons.portaria,
    color: "success",
    route: "/ControlePortaria",
  }

];