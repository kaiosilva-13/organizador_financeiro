# Controle de compras — integração com o back-end

Esta pasta concentra a UI da seção de compras parceladas. Nesta entrega o fluxo
roda inteiramente no front-end e as compras são persistidas em
`localStorage` (`organizae:purchases`) apenas para viabilizar os testes
visuais. O contrato de dados e a estrutura relacional sugerida estão em
[`src/types/purchase.ts`](../../types/purchase.ts).

## Endpoints a implementar

| Método | Rota | Responsabilidade |
| --- | --- | --- |
| `GET` | `/api/purchases` | Listar compras do usuário com o cronograma de parcelas. |
| `POST` | `/api/purchases` | Criar a compra e gerar as parcelas no servidor. |
| `POST` | `/api/purchases/:purchaseId/installments/:installmentId/pay` | Pagar uma parcela. |
| `DELETE` | `/api/purchases/:id` | Excluir a compra e suas parcelas pendentes. |

## Regras de negócio do pagamento

O endpoint de pagamento deve executar, na mesma transação de banco de dados:

1. Marcar a parcela como `PAGA` e gravar `paid_at` com a data atual do
   pagamento (não o vencimento), além de `account_id` e o comprovante.
2. Criar uma despesa em Movimentações com o título `Pagamento de <compra>` e a
   categoria `Compra <compra>`.
3. Debitar o valor da parcela do saldo da conta financeira escolhida.
4. Salvar o comprovante (PDF, JPG ou PNG, até 10 MB) no storage e persistir a
   referência.

## Geração das parcelas

- Contar os meses do intervalo de forma inclusiva (`01/12/2026` a
  `01/06/2027` = 7 parcelas).
- Distribuir os centavos restantes nas primeiras parcelas para que a soma seja
  exatamente igual ao valor total.
- Usar o dia da data de início em todos os vencimentos, ajustando para o
  último dia nos meses mais curtos; a última parcela usa a data de fim
  informada.
- Aplicar `user_id` em todas as consultas para isolar os dados por usuário.

## Autenticação

A rota `/controle-de-compras` está liberada temporariamente sem autenticação
para os testes de front-end. Ao reativar o bloqueio, remover também o fallback
de contas de demonstração em `src/pages/PurchasesControl.tsx` e envolver a rota
em um guard autenticado em `src/App.tsx`.
