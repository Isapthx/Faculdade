
# Sistema de Gerenciamento de Micro Comércios - Auto e Lazer

Protótipo funcional feito em React + Vite para rodar no VS Code.

## Como rodar

1. Extraia o ZIP.
2. Abra a pasta no VS Code.
3. No terminal, rode:

```bash
npm install
npm run dev
```

4. Abra o link mostrado no terminal, geralmente `http://localhost:5173`.

## Login de demonstração

Não há senha nesta versão. O sistema salva os dados no navegador usando `localStorage`.

## Recursos implementados

- Dashboard com alertas de estoque mínimo e validade.
- Cadastro, edição e remoção de produtos.
- Gerenciamento de lotes com validade.
- PDV com baixa automática no estoque usando FEFO.
- Pagamentos em Dinheiro, PIX, Cartão e Faturado.
- Cadastro de clientes e vínculo opcional em vendas.
- Histórico de consumo por cliente.
- Fechamento de caixa diário.
- Relatório de lucro bruto por período.
- Curva ABC por faturamento.
