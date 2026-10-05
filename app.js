const CHAVE_PRODUTOS = 'podrex-simples:produtos';
const CHAVE_ID_PRODUTOS = 'podrex-simples:id-produtos';
const CHAVE_CARRINHO = 'podrex-simples:carrinho';
const CHAVE_PEDIDOS = 'podrex-simples:pedidos';
const CHAVE_ID_PEDIDOS = 'podrex-simples:id-pedidos';
const TAXA_ENTREGA = 2.50;
const QUANTIDADE_MAXIMA = 99;
const TAMANHO_MAXIMO_IMAGEM = 350 * 1024;
const IMAGEM_PADRAO = 'imagens/prato.svg';
const CATEGORIAS = ['Marmitas', 'Pratos', 'Bebidas', 'Sobremesas'];
const TIPOS_ENTREGA = ['Retirada', 'Consumo no local', 'Delivery'];
const STATUS_PEDIDOS = ['Pendente', 'Em preparo', 'Pronto', 'Finalizado', 'Cancelado'];
class Produto {
  constructor(nome, descricao, preco, categoria, imagem) {
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.categoria = categoria;
    this.imagem = imagem;
  }

  get id() { return this._id; }
  set id(id) { this._id = Number(id); }

  get nome() { return this._nome; }
  set nome(nome) {
    const texto = String(nome).trim();
    if (texto === '') throw new Error('Informe o nome do produto.');
    if (texto.length > 80) throw new Error('O nome deve ter até 80 caracteres.');
    this._nome = texto;
  }

  get descricao() { return this._descricao; }
  set descricao(descricao) {
    const texto = String(descricao).trim();
    if (texto === '') throw new Error('Informe a descrição do produto.');
    if (texto.length > 300) throw new Error('A descrição deve ter até 300 caracteres.');
    this._descricao = texto;
  }

  get preco() { return this._preco; }
  set preco(preco) {
    const numero = Number(preco);
    if (!Number.isFinite(numero) || numero <= 0 || numero > 10000) {
      throw new Error('Informe um preço maior que zero e até R$ 10.000,00.');
    }
    this._preco = Math.round(numero * 100) / 100;
  }

  get categoria() { return this._categoria; }
  set categoria(categoria) {
    if (!CATEGORIAS.includes(categoria)) throw new Error('Selecione uma categoria válida.');
    this._categoria = categoria;
  }

  get imagem() { return this._imagem; }
  set imagem(imagem) { this._imagem = imagem || IMAGEM_PADRAO; }
}
class BdProdutos {
  constructor() {
    this._produtos = [];
    this.carregarDoLocalStorage();
  }

  get produtos() { return this._produtos; }

  getProximoId() {
    let ultimoId = Number(localStorage.getItem(CHAVE_ID_PRODUTOS)) || 0;
    this._produtos.forEach((produto) => {
      if (produto.id > ultimoId) ultimoId = produto.id;
    });
    return ultimoId + 1;
  }

  adicionarProduto(produto) {
    produto.id = this.getProximoId();
    const novaLista = this._produtos.slice();
    novaLista.push(produto);
    localStorage.setItem(CHAVE_ID_PRODUTOS, produto.id);
    salvarDados(CHAVE_PRODUTOS, novaLista);
    this._produtos = novaLista;
  }

  buscarProdutoPorId(id) {
    return this._produtos.find((produto) => produto.id === Number(id));
  }

  editarProduto(id, produtoEditado) {
    if (!this.buscarProdutoPorId(id)) throw new Error('Produto não encontrado.');
    produtoEditado.id = id;
    const novaLista = this._produtos.slice();
    novaLista.forEach((produto, indice) => {
      if (produto.id === Number(id)) novaLista[indice] = produtoEditado;
    });
    salvarDados(CHAVE_PRODUTOS, novaLista);
    this._produtos = novaLista;
  }

  removerProduto(id) {
    if (!this.buscarProdutoPorId(id)) throw new Error('Produto não encontrado.');
    const novaLista = this._produtos.filter((produto) => produto.id !== Number(id));
    salvarDados(CHAVE_PRODUTOS, novaLista);
    this._produtos = novaLista;
  }

  carregarDoLocalStorage() {
    const dados = lerDados(CHAVE_PRODUTOS);
    this._produtos = [];
    if (dados === null) {
      this.cadastrarProdutosIniciais();
      return;
    }
    if (!Array.isArray(dados)) throw new Error('O cardápio salvo tem formato inválido.');
    dados.forEach((dadosProduto) => {
      this._produtos.push(recriarProduto(dadosProduto));
    });
  }

  cadastrarProdutosIniciais() {
    this.adicionarProduto(new Produto('Marmita da casa', 'Frango grelhado, arroz, feijão e salada.', 24.90, 'Marmitas', 'imagens/marmita.svg'));
    this.adicionarProduto(new Produto('Marmita vegetariana', 'Legumes assados, arroz, feijão e folhas.', 22.90, 'Marmitas', 'imagens/vegetariano.svg'));
    this.adicionarProduto(new Produto('Massa ao pomodoro', 'Massa com molho de tomate, manjericão e queijo.', 29.90, 'Pratos', 'imagens/massa.svg'));
    this.adicionarProduto(new Produto('Grelhado especial', 'Carne grelhada com batatas e salada.', 36.90, 'Pratos', 'imagens/prato.svg'));
    this.adicionarProduto(new Produto('Suco de laranja', 'Suco natural preparado na hora. Copo de 400 ml.', 8.50, 'Bebidas', 'imagens/suco.svg'));
    this.adicionarProduto(new Produto('Pudim de leite', 'Uma fatia de pudim com calda de caramelo.', 10.90, 'Sobremesas', 'imagens/pudim.svg'));
  }
}
class ItemCarrinho {
  constructor(produto, quantidade) {
    this._produto = produto;
    this.quantidade = quantidade;
  }

  get produto() { return this._produto; }
  get quantidade() { return this._quantidade; }
  set quantidade(quantidade) {
    const numero = Number(quantidade);
    if (!Number.isInteger(numero) || numero < 1 || numero > QUANTIDADE_MAXIMA) {
      throw new Error('A quantidade deve ser um inteiro entre 1 e 99.');
    }
    this._quantidade = numero;
  }

  calcularTotal() {
    return Math.round(this.produto.preco * 100) * this.quantidade / 100;
  }
}
class Carrinho {
  constructor() {
    this._itensCarrinho = [];
    this.tipoEntrega = 'Retirada';
  }

  get itensCarrinho() { return this._itensCarrinho; }
  get tipoEntrega() { return this._tipoEntrega; }
  set tipoEntrega(tipoEntrega) {
    if (!TIPOS_ENTREGA.includes(tipoEntrega)) throw new Error('Escolha um tipo de atendimento válido.');
    this._tipoEntrega = tipoEntrega;
  }

  adicionarItemAoCarrinho(produto, quantidade = 1) {
    const novoItem = new ItemCarrinho(produto, quantidade);
    const existente = this._itensCarrinho.find((item) => item.produto.id === produto.id);
    if (existente) existente.quantidade = existente.quantidade + novoItem.quantidade;
    else this._itensCarrinho.push(novoItem);
  }

  alterarQuantidade(id, quantidade) {
    const item = this._itensCarrinho.find((item) => item.produto.id === Number(id));
    if (!item) throw new Error('Item não encontrado no carrinho.');
    item.quantidade = quantidade;
  }

  removerItemDoCarrinho(id) {
    this._itensCarrinho = this._itensCarrinho.filter((item) => item.produto.id !== Number(id));
  }

  limparCarrinho() { this._itensCarrinho = []; }

  calcularSubtotal() {
    let totalCentavos = 0;
    this._itensCarrinho.forEach((item) => {
      totalCentavos += Math.round(item.calcularTotal() * 100);
    });
    return totalCentavos / 100;
  }

  calcularEntrega() {
    let temMarmita = false;
    this._itensCarrinho.forEach((item) => {
      if (item.produto.categoria === 'Marmitas') temMarmita = true;
    });
    if (this.tipoEntrega === 'Delivery' && temMarmita) return TAXA_ENTREGA;
    return 0;
  }

  calcularTotal() {
    return (Math.round(this.calcularSubtotal() * 100) + Math.round(this.calcularEntrega() * 100)) / 100;
  }

  contarItens() {
    let quantidade = 0;
    this._itensCarrinho.forEach((item) => { quantidade += item.quantidade; });
    return quantidade;
  }

  salvarNoLocalStorage() {
    const dadosItens = [];
    this._itensCarrinho.forEach((item) => {
      dadosItens.push({ produtoId: item.produto.id, quantidade: item.quantidade });
    });
    salvarDados(CHAVE_CARRINHO, { itens: dadosItens, tipoEntrega: this.tipoEntrega });
  }

  carregarDoLocalStorage(bancoProdutos) {
    const dados = lerDados(CHAVE_CARRINHO);
    this._itensCarrinho = [];
    if (dados === null) return;
    this.tipoEntrega = dados.tipoEntrega;
    dados.itens.forEach((dadosItem) => {
      const produto = bancoProdutos.buscarProdutoPorId(dadosItem.produtoId);
      if (produto) this.adicionarItemAoCarrinho(produto, dadosItem.quantidade);
    });
  }

  atualizarProdutos(bancoProdutos) {
    const itensAtualizados = [];
    this._itensCarrinho.forEach((item) => {
      const produto = bancoProdutos.buscarProdutoPorId(item.produto.id);
      if (produto) itensAtualizados.push(new ItemCarrinho(produto, item.quantidade));
    });
    this._itensCarrinho = itensAtualizados;
  }
}
class Pedido {
  constructor(nomeCliente, carrinho, tipoEntrega, endereco = '', status = 'Pendente', data = new Date()) {
    if (carrinho.itensCarrinho.length === 0) throw new Error('O pedido precisa ter pelo menos um item.');
    this.nomeCliente = nomeCliente;
    this.tipoEntrega = tipoEntrega;
    this.endereco = endereco;
    this.status = status;
    this._data = new Date(data);
    if (Number.isNaN(this._data.getTime())) throw new Error('Data do pedido inválida.');
    this._carrinho = new Carrinho();
    this._carrinho.tipoEntrega = tipoEntrega;
    carrinho.itensCarrinho.forEach((item) => {
      const produto = copiarProduto(item.produto);
      this._carrinho.adicionarItemAoCarrinho(produto, item.quantidade);
    });
  }

  get id() { return this._id; }
  set id(id) { this._id = Number(id); }
  get nomeCliente() { return this._nomeCliente; }
  set nomeCliente(nomeCliente) {
    const nome = String(nomeCliente).trim();
    if (nome === '') throw new Error('Informe o nome do cliente.');
    if (nome.length > 80) throw new Error('O nome do cliente deve ter até 80 caracteres.');
    this._nomeCliente = nome;
  }
  get tipoEntrega() { return this._tipoEntrega; }
  set tipoEntrega(tipoEntrega) {
    if (!TIPOS_ENTREGA.includes(tipoEntrega)) throw new Error('Tipo de atendimento inválido.');
    this._tipoEntrega = tipoEntrega;
  }
  get endereco() { return this._endereco; }
  set endereco(endereco) {
    const texto = String(endereco).trim();
    if (this.tipoEntrega === 'Delivery' && texto === '') throw new Error('Informe o endereço para delivery.');
    if (texto.length > 250) throw new Error('O endereço deve ter até 250 caracteres.');
    this._endereco = texto;
  }
  get status() { return this._status; }
  set status(status) {
    if (!STATUS_PEDIDOS.includes(status)) throw new Error('Selecione um status válido.');
    this._status = status;
  }
  get data() { return this._data; }
  get carrinho() { return this._carrinho; }
  calcularSubtotal() { return this.carrinho.calcularSubtotal(); }
  calcularEntrega() { return this.carrinho.calcularEntrega(); }
  calcularTotal() { return this.carrinho.calcularTotal(); }
}
class BdPedidos {
  constructor() {
    this._pedidos = [];
    this.carregarDoLocalStorage();
  }

  get pedidos() { return this._pedidos; }

  getProximoId() {
    let ultimoId = Number(localStorage.getItem(CHAVE_ID_PEDIDOS)) || 0;
    this._pedidos.forEach((pedido) => {
      if (pedido.id > ultimoId) ultimoId = pedido.id;
    });
    return ultimoId + 1;
  }

  adicionarPedido(pedido) {
    pedido.id = this.getProximoId();
    const novaLista = this._pedidos.slice();
    novaLista.unshift(pedido);
    localStorage.setItem(CHAVE_ID_PEDIDOS, pedido.id);
    salvarDados(CHAVE_PEDIDOS, novaLista);
    this._pedidos = novaLista;
  }

  buscarPedidoPorId(id) {
    return this._pedidos.find((pedido) => pedido.id === Number(id));
  }

  editarPedido(id, pedidoEditado) {
    if (!this.buscarPedidoPorId(id)) throw new Error('Pedido não encontrado.');
    pedidoEditado.id = id;
    const novaLista = this._pedidos.slice();
    novaLista.forEach((pedido, indice) => {
      if (pedido.id === Number(id)) novaLista[indice] = pedidoEditado;
    });
    salvarDados(CHAVE_PEDIDOS, novaLista);
    this._pedidos = novaLista;
  }

  removerPedido(id) {
    const novaLista = this._pedidos.filter((pedido) => pedido.id !== Number(id));
    salvarDados(CHAVE_PEDIDOS, novaLista);
    this._pedidos = novaLista;
  }

  carregarDoLocalStorage() {
    const dados = lerDados(CHAVE_PEDIDOS) || [];
    if (!Array.isArray(dados)) throw new Error('Os pedidos salvos têm formato inválido.');
    this._pedidos = [];
    dados.forEach((dadosPedido) => {
      const carrinhoSalvo = new Carrinho();
      dadosPedido._carrinho._itensCarrinho.forEach((dadosItem) => {
        const produto = recriarProduto(dadosItem._produto);
        carrinhoSalvo.adicionarItemAoCarrinho(produto, dadosItem._quantidade);
      });
      const pedido = new Pedido(
        dadosPedido._nomeCliente, carrinhoSalvo, dadosPedido._tipoEntrega,
        dadosPedido._endereco, dadosPedido._status, dadosPedido._data
      );
      pedido.id = dadosPedido._id;
      this._pedidos.push(pedido);
    });
  }
}
let bdProdutos;
let bdPedidos;
let carrinho;
let indiceDestaque = 0;
let idProdutoEditando = null;
let idPedidoEditando = null;
let salvandoProduto = false;
function lerDados(chave) {
  try {
    const texto = localStorage.getItem(chave);
    if (texto === null) return null;
    return JSON.parse(texto);
  } catch (erro) {
    throw new Error('Não foi possível ler os dados salvos. Verifique o armazenamento do navegador.');
  }
}

function salvarDados(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch (erro) {
    throw new Error('Não foi possível salvar. O armazenamento pode estar cheio ou bloqueado.');
  }
}

function recriarProduto(dados) {
  const produto = new Produto(dados._nome, dados._descricao, dados._preco, dados._categoria, dados._imagem);
  produto.id = dados._id;
  return produto;
}

function copiarProduto(produto) {
  const copia = new Produto(produto.nome, produto.descricao, produto.preco, produto.categoria, produto.imagem);
  copia.id = produto.id;
  return copia;
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mostrarMensagem(texto, erro = false) {
  const mensagem = document.getElementById('mensagem');
  mensagem.textContent = texto;
  mensagem.classList.toggle('mensagem--erro', erro);
  mensagem.hidden = false;
}
function criarBotao(texto, acao) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = texto;
  botao.addEventListener('click', acao);
  return botao;
}

function criarImagem(produto) {
  const imagem = document.createElement('img');
  imagem.src = produto.imagem;
  imagem.alt = produto.nome;
  imagem.width = 480;
  imagem.height = 320;
  imagem.addEventListener('error', () => {
    if (!imagem.src.endsWith('/' + IMAGEM_PADRAO)) imagem.src = IMAGEM_PADRAO;
  });
  return imagem;
}

function mostrarEstadoVazio(container, texto) {
  const mensagem = document.createElement('p');
  mensagem.className = 'estado-vazio';
  mensagem.textContent = texto;
  container.appendChild(mensagem);
}

function atualizarContadorCarrinho() {
  document.getElementById('contadorCarrinho').textContent = carrinho.contarItens();
}
function exibirPagina(nomePagina) {
  const paginas = document.querySelectorAll('.pagina');
  paginas.forEach((pagina) => { pagina.hidden = pagina.id !== nomePagina; });
  const links = document.querySelectorAll('.link-pagina');
  links.forEach((link) => {
    if (link.dataset.pagina === nomePagina) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.getElementById(nomePagina).querySelector('h1').focus();
}

function criarNavegacaoEventListeners() {
  const links = document.querySelectorAll('.link-pagina');
  links.forEach((link) => {
    link.addEventListener('click', (evento) => {
      evento.preventDefault();
      exibirPagina(link.dataset.pagina);
    });
  });
}

function obterProdutosFiltrados() {
  const categoria = document.querySelector('input[name="categoria"]:checked').value;
  const busca = document.getElementById('buscaPorNome').value.trim().toLowerCase();
  return bdProdutos.produtos.filter((produto) => {
    const pertenceCategoria = categoria === '' || produto.categoria === categoria;
    const correspondeBusca = produto.nome.toLowerCase().includes(busca);
    return pertenceCategoria && correspondeBusca;
  });
}

function exibirCardapio() {
  const lista = document.getElementById('listaProdutos');
  lista.replaceChildren();
  const produtos = obterProdutosFiltrados();
  produtos.forEach((produto) => lista.appendChild(criarCardProduto(produto, false)));
  document.getElementById('resultadoBusca').textContent = produtos.length + ' produtos encontrados';
  if (produtos.length === 0) mostrarEstadoVazio(lista, 'Nenhum produto encontrado. Tente outra busca ou categoria.');
}

function criarCardProduto(produto, gerenciar) {
  const card = document.createElement('article');
  card.className = 'card-produto';
  const imagem = criarImagem(produto);
  const conteudo = document.createElement('div');
  conteudo.className = 'card-produto__conteudo';
  const categoria = document.createElement('span');
  categoria.className = 'categoria';
  categoria.textContent = produto.categoria;
  const nome = document.createElement('h3');
  nome.textContent = produto.nome;
  const descricao = document.createElement('p');
  descricao.className = 'descricao';
  descricao.textContent = produto.descricao;
  const preco = document.createElement('strong');
  preco.className = 'preco';
  preco.textContent = formatarMoeda(produto.preco);
  const acoes = document.createElement('div');
  acoes.className = 'acoes';
  if (gerenciar) {
    const editar = criarBotao('Editar', () => preencherFormularioProduto(produto));
    editar.setAttribute('aria-label', 'Editar ' + produto.nome);
    const excluir = criarBotao('Excluir', () => excluirProduto(produto.id));
    excluir.className = 'botao-perigo';
    excluir.setAttribute('aria-label', 'Excluir ' + produto.nome);
    acoes.append(editar, excluir);
  } else {
    const adicionar = criarBotao('+ Adicionar', () => adicionarProdutoAoCarrinho(produto.id));
    adicionar.className = 'botao-principal';
    adicionar.setAttribute('aria-label', 'Adicionar ' + produto.nome + ' ao carrinho');
    acoes.appendChild(adicionar);
  }
  conteudo.append(categoria, nome, descricao, preco, acoes);
  card.append(imagem, conteudo);
  return card;
}

function exibirDestaque() {
  const container = document.getElementById('destaque');
  container.replaceChildren();
  const produtos = bdProdutos.produtos;
  if (produtos.length === 0) {
    mostrarEstadoVazio(container, 'Cadastre um produto para exibi-lo no carrossel.');
    document.getElementById('posicaoDestaque').textContent = '0 / 0';
    document.getElementById('buttonAnterior').disabled = true;
    document.getElementById('buttonProximo').disabled = true;
    return;
  }
  if (indiceDestaque >= produtos.length) indiceDestaque = 0;
  if (indiceDestaque < 0) indiceDestaque = produtos.length - 1;
  const produto = produtos[indiceDestaque];
  const conteudo = document.createElement('div');
  conteudo.className = 'destaque__conteudo';
  const categoria = document.createElement('p');
  categoria.className = 'etiqueta';
  categoria.textContent = 'SABOR EM DESTAQUE / ' + produto.categoria;
  const nome = document.createElement('h2');
  nome.textContent = produto.nome;
  const descricao = document.createElement('p');
  descricao.textContent = produto.descricao;
  const preco = document.createElement('strong');
  preco.textContent = formatarMoeda(produto.preco);
  const adicionar = criarBotao('Adicionar ao carrinho', () => adicionarProdutoAoCarrinho(produto.id));
  adicionar.className = 'botao-principal';
  conteudo.append(categoria, nome, descricao, preco, adicionar);
  container.append(conteudo, criarImagem(produto));
  document.getElementById('posicaoDestaque').textContent = (indiceDestaque + 1) + ' / ' + produtos.length;
  document.getElementById('buttonAnterior').disabled = produtos.length < 2;
  document.getElementById('buttonProximo').disabled = produtos.length < 2;
}

function criarCardapioEventListeners() {
  document.getElementById('buscaPorNome').addEventListener('input', exibirCardapio);
  document.querySelectorAll('input[name="categoria"]').forEach((categoria) => {
    categoria.addEventListener('change', exibirCardapio);
  });
  document.getElementById('buttonAnterior').addEventListener('click', () => {
    indiceDestaque -= 1;
    exibirDestaque();
  });
  document.getElementById('buttonProximo').addEventListener('click', () => {
    indiceDestaque += 1;
    exibirDestaque();
  });
}

function atualizarTelas() {
  exibirCardapio();
  exibirDestaque();
  exibirCarrinho();
  exibirGerenciamento();
  exibirPedidos();
  atualizarContadorCarrinho();
}

function adicionarProdutoAoCarrinho(id) {
  try {
    const produto = bdProdutos.buscarProdutoPorId(id);
    carrinho.adicionarItemAoCarrinho(produto);
    carrinho.salvarNoLocalStorage();
    exibirCarrinho();
    atualizarContadorCarrinho();
    document.getElementById('pedidoSucesso').hidden = true;
    mostrarMensagem(produto.nome + ' adicionado ao carrinho.');
  } catch (erro) {
    carrinho.carregarDoLocalStorage(bdProdutos);
    mostrarMensagem(erro.message, true);
  }
}

function exibirCarrinho() {
  const lista = document.getElementById('listaCarrinho');
  lista.replaceChildren();
  carrinho.itensCarrinho.forEach((item) => lista.appendChild(criarCardItemCarrinho(item)));
  if (carrinho.itensCarrinho.length === 0) mostrarEstadoVazio(lista, 'Seu carrinho está vazio. Adicione um produto no cardápio.');
  atualizarResumo();
}

function criarCardItemCarrinho(item) {
  const card = document.createElement('article');
  card.className = 'item-carrinho';
  const conteudo = document.createElement('div');
  const nome = document.createElement('h3');
  nome.textContent = item.produto.nome;
  const preco = document.createElement('p');
  preco.textContent = formatarMoeda(item.produto.preco) + ' por unidade';
  const total = document.createElement('strong');
  total.textContent = 'Total: ' + formatarMoeda(item.calcularTotal());
  conteudo.append(nome, preco, total);
  const acoes = document.createElement('div');
  acoes.className = 'item-carrinho__acoes';
  const quantidade = document.createElement('div');
  quantidade.className = 'quantidade';
  const diminuir = criarBotao('−', () => alterarQuantidadeItem(item.produto.id, item.quantidade - 1));
  diminuir.setAttribute('aria-label', 'Diminuir quantidade de ' + item.produto.nome);
  diminuir.disabled = item.quantidade <= 1;
  const numero = document.createElement('span');
  numero.textContent = item.quantidade;
  const aumentar = criarBotao('+', () => alterarQuantidadeItem(item.produto.id, item.quantidade + 1));
  aumentar.setAttribute('aria-label', 'Aumentar quantidade de ' + item.produto.nome);
  aumentar.disabled = item.quantidade >= QUANTIDADE_MAXIMA;
  quantidade.append(diminuir, numero, aumentar);
  const remover = criarBotao('Remover', () => removerItemCarrinho(item.produto.id));
  remover.className = 'botao-perigo';
  remover.setAttribute('aria-label', 'Remover ' + item.produto.nome);
  acoes.append(quantidade, remover);
  card.append(criarImagem(item.produto), conteudo, acoes);
  return card;
}

function atualizarResumo() {
  document.getElementById('subtotal').textContent = formatarMoeda(carrinho.calcularSubtotal());
  document.getElementById('taxaEntrega').textContent = formatarMoeda(carrinho.calcularEntrega());
  document.getElementById('total').textContent = formatarMoeda(carrinho.calcularTotal());
  document.getElementById('tipoEntrega').value = carrinho.tipoEntrega;
  const delivery = carrinho.tipoEntrega === 'Delivery';
  document.getElementById('campoEndereco').hidden = !delivery;
  document.getElementById('enderecoCliente').required = delivery;
  const vazio = carrinho.itensCarrinho.length === 0;
  document.getElementById('buttonFinalizar').disabled = vazio;
  document.getElementById('buttonLimparCarrinho').disabled = vazio;
}

function alterarQuantidadeItem(id, quantidade) {
  try {
    carrinho.alterarQuantidade(id, quantidade);
    carrinho.salvarNoLocalStorage();
    exibirCarrinho();
    atualizarContadorCarrinho();
    mostrarMensagem('Quantidade e total atualizados.');
  } catch (erro) {
    carrinho.carregarDoLocalStorage(bdProdutos);
    exibirCarrinho();
    mostrarMensagem(erro.message, true);
  }
}

function removerItemCarrinho(id) {
  const confirmado = window.confirm('Remover este item do carrinho?');
  if (!confirmado) return;
  try {
    carrinho.removerItemDoCarrinho(id);
    carrinho.salvarNoLocalStorage();
    exibirCarrinho();
    atualizarContadorCarrinho();
    mostrarMensagem('Item removido do carrinho.');
  } catch (erro) {
    carrinho.carregarDoLocalStorage(bdProdutos);
    exibirCarrinho();
    mostrarMensagem(erro.message, true);
  }
}

function limparCarrinho() {
  if (!window.confirm('Remover todos os itens do carrinho?')) return;
  try {
    carrinho.limparCarrinho();
    carrinho.salvarNoLocalStorage();
    exibirCarrinho();
    atualizarContadorCarrinho();
    mostrarMensagem('Carrinho limpo.');
  } catch (erro) {
    carrinho.carregarDoLocalStorage(bdProdutos);
    exibirCarrinho();
    mostrarMensagem(erro.message, true);
  }
}

function finalizarPedido(evento) {
  evento.preventDefault();
  try {
    bdProdutos.carregarDoLocalStorage();
    let cardapioAlterado = false;
    carrinho.itensCarrinho.forEach((item) => {
      const atual = bdProdutos.buscarProdutoPorId(item.produto.id);
      if (!atual || atual.preco !== item.produto.preco || atual.nome !== item.produto.nome || atual.categoria !== item.produto.categoria) {
        cardapioAlterado = true;
      }
    });
    if (cardapioAlterado) {
      carrinho.atualizarProdutos(bdProdutos);
      carrinho.salvarNoLocalStorage();
      atualizarTelas();
      mostrarMensagem('O cardápio mudou. Confira os itens e valores antes de finalizar novamente.', true);
      return;
    }
    const nome = document.getElementById('nomeCliente').value;
    const endereco = document.getElementById('enderecoCliente').value;
    const pedido = new Pedido(nome, carrinho, carrinho.tipoEntrega, endereco);
    bdPedidos.carregarDoLocalStorage();
    bdPedidos.adicionarPedido(pedido);
    const itensAnteriores = carrinho.itensCarrinho.slice();
    try {
      carrinho.limparCarrinho();
      carrinho.salvarNoLocalStorage();
    } catch (erro) {
      itensAnteriores.forEach((item) => carrinho.adicionarItemAoCarrinho(item.produto, item.quantidade));
      bdPedidos.removerPedido(pedido.id);
      throw erro;
    }
    document.getElementById('formFinalizarPedido').reset();
    document.getElementById('pedidoSucesso').hidden = false;
    document.getElementById('pedidoSucesso').textContent = 'Pedido #' + pedido.id + ' de ' + formatarMoeda(pedido.calcularTotal()) + ' registrado! Consulte a seção Pedidos.';
    atualizarTelas();
    mostrarMensagem('Pedido finalizado com sucesso.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
}

function criarCarrinhoEventListeners() {
  document.getElementById('buttonLimparCarrinho').addEventListener('click', limparCarrinho);
  document.getElementById('formFinalizarPedido').addEventListener('submit', finalizarPedido);
  document.getElementById('tipoEntrega').addEventListener('change', () => {
    try {
      carrinho.tipoEntrega = document.getElementById('tipoEntrega').value;
      carrinho.salvarNoLocalStorage();
      mostrarMensagem('Tipo de atendimento atualizado.');
    } catch (erro) {
      carrinho.carregarDoLocalStorage(bdProdutos);
      mostrarMensagem(erro.message, true);
    }
    atualizarResumo();
  });
}

function exibirGerenciamento() {
  const lista = document.getElementById('listaGerenciamento');
  lista.replaceChildren();
  bdProdutos.produtos.forEach((produto) => lista.appendChild(criarCardProduto(produto, true)));
  if (bdProdutos.produtos.length === 0) mostrarEstadoVazio(lista, 'Nenhum produto cadastrado. Use o formulário acima.');
}

function preencherFormularioProduto(produto) {
  idProdutoEditando = produto.id;
  document.getElementById('tituloFormularioProduto').textContent = 'Editar produto';
  document.getElementById('nomeProduto').value = produto.nome;
  document.getElementById('descricaoProduto').value = produto.descricao;
  document.getElementById('precoProduto').value = produto.preco;
  document.getElementById('categoriaProduto').value = produto.categoria;
  document.getElementById('imagemProduto').value = '';
  document.getElementById('buttonSalvarProduto').textContent = 'Salvar alterações';
  document.getElementById('buttonCancelarProduto').hidden = false;
  document.getElementById('nomeProduto').focus();
}

function limparFormularioProduto() {
  idProdutoEditando = null;
  document.getElementById('formProduto').reset();
  document.getElementById('tituloFormularioProduto').textContent = 'Cadastrar produto';
  document.getElementById('buttonSalvarProduto').textContent = 'Cadastrar produto';
  document.getElementById('buttonCancelarProduto').hidden = true;
}

function terminarSalvamentoProduto() {
  salvandoProduto = false;
  document.getElementById('buttonSalvarProduto').disabled = false;
  document.getElementById('buttonCancelarProduto').disabled = false;
}

function gravarProduto(imagem) {
  try {
    const produto = new Produto(
      document.getElementById('nomeProduto').value,
      document.getElementById('descricaoProduto').value,
      document.getElementById('precoProduto').value,
      document.getElementById('categoriaProduto').value,
      imagem
    );
    bdProdutos.carregarDoLocalStorage();
    if (idProdutoEditando === null) bdProdutos.adicionarProduto(produto);
    else bdProdutos.editarProduto(idProdutoEditando, produto);
    carrinho.atualizarProdutos(bdProdutos);
    limparFormularioProduto();
    atualizarTelas();
    mostrarMensagem('Produto salvo com sucesso.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
  terminarSalvamentoProduto();
}

function salvarProduto(evento) {
  evento.preventDefault();
  if (salvandoProduto) return;
  salvandoProduto = true;
  document.getElementById('buttonSalvarProduto').disabled = true;
  document.getElementById('buttonCancelarProduto').disabled = true;
  const arquivo = document.getElementById('imagemProduto').files[0];
  let imagemAtual = IMAGEM_PADRAO;
  if (idProdutoEditando !== null) {
    const produtoAtual = bdProdutos.buscarProdutoPorId(idProdutoEditando);
    if (produtoAtual) imagemAtual = produtoAtual.imagem;
  }
  if (!arquivo) {
    gravarProduto(imagemAtual);
    return;
  }
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(arquivo.type)) {
    mostrarMensagem('Escolha uma imagem PNG, JPEG ou WebP.', true);
    terminarSalvamentoProduto();
    return;
  }
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
    mostrarMensagem('Escolha uma imagem de até 350 KB.', true);
    terminarSalvamentoProduto();
    return;
  }
  const leitor = new FileReader();
  leitor.onload = () => { gravarProduto(leitor.result); };
  leitor.onerror = () => {
    mostrarMensagem('Não foi possível ler a imagem.', true);
    terminarSalvamentoProduto();
  };
  leitor.onabort = () => {
    mostrarMensagem('A leitura da imagem foi cancelada.', true);
    terminarSalvamentoProduto();
  };
  leitor.readAsDataURL(arquivo);
}

function excluirProduto(id) {
  if (!window.confirm('Excluir este produto do cardápio? Ele também sairá do carrinho. Os pedidos antigos serão preservados.')) return;
  try {
    bdProdutos.carregarDoLocalStorage();
    bdProdutos.removerProduto(id);
    carrinho.atualizarProdutos(bdProdutos);
    carrinho.salvarNoLocalStorage();
    if (idProdutoEditando === id) limparFormularioProduto();
    atualizarTelas();
    mostrarMensagem('Produto excluído.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
}

function criarGerenciamentoEventListeners() {
  document.getElementById('formProduto').addEventListener('submit', salvarProduto);
  document.getElementById('buttonCancelarProduto').addEventListener('click', limparFormularioProduto);
}

function exibirPedidos() {
  const lista = document.getElementById('listaPedidos');
  lista.replaceChildren();
  const status = document.getElementById('filtroStatus').value;
  const pedidos = bdPedidos.pedidos.filter((pedido) => status === '' || pedido.status === status);
  pedidos.forEach((pedido) => lista.appendChild(criarCardPedido(pedido)));
  if (pedidos.length === 0) mostrarEstadoVazio(lista, 'Nenhum pedido encontrado. Finalize um pedido no carrinho ou escolha outro status.');
}

function criarCardPedido(pedido) {
  const card = document.createElement('article');
  card.className = 'card-pedido';
  const numero = document.createElement('span');
  numero.className = 'categoria';
  numero.textContent = 'PEDIDO #' + pedido.id;
  const cliente = document.createElement('h3');
  cliente.textContent = pedido.nomeCliente;
  const status = document.createElement('p');
  status.className = 'status-pedido';
  status.textContent = pedido.status;
  const informacoes = document.createElement('p');
  informacoes.textContent = pedido.data.toLocaleString('pt-BR') + ' · ' + pedido.tipoEntrega;
  card.append(numero, cliente, status, informacoes);
  if (pedido.tipoEntrega === 'Delivery') {
    const endereco = document.createElement('p');
    endereco.textContent = 'Endereço: ' + pedido.endereco;
    card.appendChild(endereco);
  }
  const lista = document.createElement('ul');
  pedido.carrinho.itensCarrinho.forEach((item) => {
    const linha = document.createElement('li');
    linha.textContent = item.quantidade + '× ' + item.produto.nome + ' — ' + formatarMoeda(item.calcularTotal());
    lista.appendChild(linha);
  });
  const valores = document.createElement('p');
  valores.textContent = 'Subtotal: ' + formatarMoeda(pedido.calcularSubtotal()) + ' · Entrega: ' + formatarMoeda(pedido.calcularEntrega());
  const total = document.createElement('strong');
  total.className = 'preco';
  total.textContent = 'Total: ' + formatarMoeda(pedido.calcularTotal());
  const acoes = document.createElement('div');
  acoes.className = 'acoes';
  const editar = criarBotao('Editar pedido', () => preencherFormularioPedido(pedido));
  editar.setAttribute('aria-label', 'Editar pedido ' + pedido.id);
  const excluir = criarBotao('Excluir', () => excluirPedido(pedido.id));
  excluir.className = 'botao-perigo';
  excluir.setAttribute('aria-label', 'Excluir pedido ' + pedido.id);
  acoes.append(editar, excluir);
  card.append(lista, valores, total, acoes);
  return card;
}

function preencherFormularioPedido(pedido) {
  idPedidoEditando = pedido.id;
  document.getElementById('editarPedido').hidden = false;
  document.getElementById('tituloEditarPedido').textContent = 'Editar pedido #' + pedido.id;
  document.getElementById('editarNomeCliente').value = pedido.nomeCliente;
  document.getElementById('editarTipoEntrega').value = pedido.tipoEntrega;
  document.getElementById('editarEndereco').value = pedido.endereco;
  document.getElementById('editarStatus').value = pedido.status;
  document.getElementById('editarNomeCliente').focus();
}

function cancelarEdicaoPedido() {
  idPedidoEditando = null;
  document.getElementById('editarPedido').hidden = true;
}

function salvarPedidoEditado(evento) {
  evento.preventDefault();
  try {
    bdPedidos.carregarDoLocalStorage();
    const original = bdPedidos.buscarPedidoPorId(idPedidoEditando);
    if (!original) throw new Error('Esse pedido não está mais disponível.');
    const editado = new Pedido(
      document.getElementById('editarNomeCliente').value, original.carrinho,
      document.getElementById('editarTipoEntrega').value,
      document.getElementById('editarEndereco').value,
      document.getElementById('editarStatus').value, original.data
    );
    bdPedidos.editarPedido(original.id, editado);
    cancelarEdicaoPedido();
    exibirPedidos();
    mostrarMensagem('Pedido atualizado.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
}

function excluirPedido(id) {
  if (!window.confirm('Excluir definitivamente o pedido #' + id + '?')) return;
  try {
    bdPedidos.carregarDoLocalStorage();
    bdPedidos.removerPedido(id);
    if (idPedidoEditando === id) cancelarEdicaoPedido();
    exibirPedidos();
    mostrarMensagem('Pedido excluído.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
}

function criarPedidosEventListeners() {
  document.getElementById('filtroStatus').addEventListener('change', exibirPedidos);
  document.getElementById('formEditarPedido').addEventListener('submit', salvarPedidoEditado);
  document.getElementById('buttonCancelarPedido').addEventListener('click', cancelarEdicaoPedido);
}

function criarArmazenamentoEventListener() {
  window.addEventListener('storage', (evento) => {
    if (evento.key !== CHAVE_PRODUTOS && evento.key !== CHAVE_CARRINHO && evento.key !== CHAVE_PEDIDOS && evento.key !== null) return;
    try {
      bdProdutos.carregarDoLocalStorage();
      bdPedidos.carregarDoLocalStorage();
      carrinho.carregarDoLocalStorage(bdProdutos);
      atualizarTelas();
      mostrarMensagem('Dados atualizados a partir de outra aba.');
    } catch (erro) { mostrarMensagem(erro.message, true); }
  });
}
function inicializarAplicacao() {
  try {
    bdProdutos = new BdProdutos();
    bdPedidos = new BdPedidos();
    carrinho = new Carrinho();
    carrinho.carregarDoLocalStorage(bdProdutos);
    criarNavegacaoEventListeners();
    criarCardapioEventListeners();
    criarCarrinhoEventListeners();
    criarGerenciamentoEventListeners();
    criarPedidosEventListeners();
    criarArmazenamentoEventListener();
    atualizarTelas();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
    document.getElementById('aplicacao').hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', inicializarAplicacao);
