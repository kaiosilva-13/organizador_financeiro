# Módulo de Banco de Dados — Organizaê

Este diretório centraliza a documentação conceitual, o modelo de dados em PostgreSQL e os scripts DDL/DML divididos segundo o cronograma oficial do Projeto Integrador (IFRN - Campus Currais Novos)[cite: 1, 8].

---

## 📂 Estrutura e Organização de Pastas

```text
banco-de-dados/
├── docs/
│   ├── README.md                            <-- Este arquivo de documentação
│   ├── projeto_integrador_descritivo.pdf    <-- Documento do projeto (RFs, RNFs e Cronograma)
│   ├── DER_modelo_conceitual.png           <-- Diagrama Entidade-Relacionamento Conceitual
│   └── caso_de_uso_geral.png                <-- Diagrama de Casos de Uso do Sistema
│
├── scripts/
│   ├── etapa-01/                            <-- Autenticação e Login
│   ├── etapa-02/                            <-- Contas e Perfil
│   ├── etapa-03/                            <-- Movimentações e Gastos Fixos
│   ├── etapa-04/                            <-- Metas e Compras
│   └── etapa-05/                            <-- Insights e Projeções
│
└── testes/
    ├── etapa-01/                            <-- Suíte de testes da Etapa 01
    ├── etapa-02/
    ├── etapa-03/
    ├── etapa-04/
    └── etapa-05/

## 📅 Cronograma de Desenvolvimento por Etapas

### 🔹 Etapa 01: Autenticação e Gestão de Acesso
* **Período:** `24/09/2026 a 09/10/2026`
* **Objetivo:** Criar a estrutura inicial de dados para suporte às telas de login, cadastro de usuários e regras de recuperação de acesso.

---

### 🔹 Etapa 02: Gestão de Contas Financeiras e Perfil
* **Período:** `10/10/2026 a 24/10/2026`
* **Objetivo:** Modelar e implementar a tabela de contas lógicas (bancos/carteiras) vinculadas ao usuário e registrar o saldo inicial.

---

### 🔹 Etapa 03: Movimentações Financeiras, Categorias e Gastos Fixos
* **Período:** `25/10/2026 a 08/11/2026`
* **Objetivo:** Estruturar as tabelas de entradas/saídas, categorização e despesas recorrentes com controle de vencimentos mensais.

---

### 🔹 Etapa 04: Metas de Poupança e Controle de Compras
* **Período:** `09/11/2026 a 23/11/2026`
* **Objetivo:** Implementar o suporte de dados para acompanhamento de metas de economia e controle de compras parceladas de grande porte.

---

### 🔹 Etapa 05: Insights Financeiros, Projeções e Deploy
* **Período:** `24/11/2026 a 09/12/2026`
* **Objetivo:** Criar a tabela de orientações educativas, dar suporte ao simulador de gastos futuros sem afetar a base real e preparar o SGBD para produção.