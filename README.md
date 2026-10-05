# Podrex

Felipe Theodoro de Paula - SP3199151

Sistema de pedidos de restaurante feito com HTML, CSS e JavaScript puro. 

## Como executar

1. Extraia o arquivo ZIP.
2. Mantenha `index.html`, `app.js`, `style.css` e a pasta `imagens` juntos.
3. Abra `index.html` no navegador.


## Estrutura

```text
index.html      Estrutura das quatro seções e formulários
app.js          Constantes, classes, funções e eventos
style.css       Cores, componentes e layout responsivo
imagens/        Ilustrações locais dos pratos
README.md       Orientações de uso
```

## Classes

- **Produto:** nome, descrição, preço, categoria e imagem.
- **BdProdutos:** cadastrar, consultar, editar e excluir produtos; salvar e recuperar o cardápio.
- **ItemCarrinho:** produto, quantidade e total do item.
- **Carrinho:** itens, atendimento, subtotal, taxa e total.
- **Pedido:** cliente, cópia do carrinho, atendimento, endereço, status e data.
- **BdPedidos:** cadastrar, consultar, editar e excluir pedidos; salvar e recuperar o histórico.

As relações usam composição: um carrinho contém itens e um item contém um produto. Um pedido guarda uma cópia de seus produtos para preservar nome e preço mesmo após alterar o cardápio.

## Funcionalidades

- **Cardápio:** seis produtos iniciais, carrossel manual com imagem/nome/preço, busca e filtro por categoria.
- **Carrinho:** adicionar, aumentar/diminuir quantidades, remover e limpar com confirmação, totais atualizados automaticamente.
- **Atendimento:** Retirada, Consumo no local ou Delivery. A taxa de R$ 2,50 é cobrada uma vez por delivery contendo marmita; nos demais casos não há taxa.
- **Finalização:** nome obrigatório, endereço obrigatório para delivery e bloqueio de pedido vazio.
- **Gerenciar:** cadastro, edição e exclusão de produtos; imagem opcional PNG/JPEG/WebP até 350 KB.
- **Pedidos:** histórico com data, itens, status, subtotal, taxa e total; edição de cliente, atendimento, endereço e status, além de exclusão com confirmação. Itens e preços originais são preservados.
- **Persistência:** produtos, carrinho, pedidos e contadores de ID salvos no localStorage. Atualizações de outra aba são recebidas pelo evento `storage` quando suportado pelo navegador.

Os dados de demonstração são cadastrados somente quando não há cardápio salvo. Excluir todos os produtos não os recria ao recarregar. As chaves começam com `podrex-simples:` e não sobrescrevem os dados das versões anteriores.

## Boas práticas e IHC

Nomes claros, funções por responsabilidade, constantes nomeadas, `const` por padrão, `let` para reatribuição e comparações estritas. Formulários têm rótulos e validação; exclusões exigem confirmação; ações exibem feedback. O CSS mantém estilos consistentes, foco visível e adaptação ao celular. Valores são multiplicados e somados em centavos para reduzir erros de precisão.

A leitura de uma imagem usa `FileReader` com `onload` e `onerror`. É um único callback de operação assíncrona: o produto só é gravado quando a leitura termina. Não há encadeamento de Promises.

## Teste manual

1. Adicione uma marmita duas vezes e confira a quantidade no carrinho.
2. Escolha Delivery: a taxa deve ser R$ 2,50, mesmo alterando a quantidade.
3. Escolha Retirada ou Consumo no local: a taxa deve ser zero.
4. Finalize com nome e endereço e confira o registro em Pedidos.
5. Cadastre um produto sem imagem, edite seu preço e exclua com confirmação.
6. Edite o status de um pedido e recarregue a página para conferir a persistência.
7. Altere ou exclua um produto do cardápio e confirme que o pedido antigo mantém seus dados.

Não há envio real ao restaurante, autenticação, pagamento ou banco de dados remoto. O projeto demonstra o exercício no navegador.