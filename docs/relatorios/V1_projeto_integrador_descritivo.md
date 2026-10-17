# 📘 INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DO RIO GRANDE DO NORTE

**DISCENTES:** KAIO VITOR, MELYSSA TAINÁ, NATANAEL, ANTONY THIAGO E LUIZ FELIPE

**DESCRITIVO GERAL DO PROJETO INTEGRADOR:** GERENCIADOR FINANCEIRO PESSOAL INTELIGENTE - ORGANIZAÊ

**LOCALIDADE:** CURRAIS-NOVOS/RN

**ANO:** 2026

> ℹ️ **Nota de Visualização:** *Caso o arquivo PDF anexado no repositório não consiga ser visualizado diretamente pelo navegador no GitHub, utilize este documento em Markdown como resumo e consulta integral do que está contido nele, sem a necessidade de realizar o download.*

## SISTEMA DE GERENCIADOR FINANCEIRO PESSOAL INTELIGENTE - ORGANIZAÊ

Muitas pessoas enfrentam dificuldades para manter a saúde financeira em dia. O problema central não é apenas a falta de registro dos gastos diários, mas o esquecimento de datas de vencimento de contas, a falta de clareza sobre o orçamento futuro ao assumir parcelamentos e a ausência de orientações práticas para a tomada de decisões de consumo mais conscientes.

Para resolver essas dores, o Gerenciador Financeiro Pessoal Inteligente surge como uma plataforma web centralizada. O sistema exige que cada Usuário Financeiro realize o cadastro e login para acessar seu perfil exclusivo. A partir daí, o usuário pode realizar a gestão completa de suas movimentações diárias (receitas e despesas), onde a seleção de uma categoria (como Alimentação ou Moradia) é indispensável para concluir o registro. De forma opcional, o usuário também pode anexar comprovantes fiscais em formato digital a cada movimentação.

Além das despesas eventuais, o sistema permite o cadastro de gastos fixos recorrentes e a definição de metas de economia, exibindo o progresso em direção a cada objetivo. No painel principal (Dashboard), o usuário visualiza gráficos com saldos consolidados e alertas de vencimento. Como recurso ativo de apoio, a plataforma envia automaticamente alertas por e-mail informando sobre contas prestes a vencer e pendências que já estão em atraso.

O grande diferencial tecnológico da plataforma é o módulo de simulação de gastos futuros, que permite simular novas compras parceladas ou despesas hipotéticas para prever o impacto no saldo dos próximos meses sem afetar a base de dados real. Por fim, para promover a conscientização financeira, a aplicação analisa os hábitos do usuário e exibe pequenos insights e orientações educativas diretamente na interface, permitindo ainda a emissão e a exportação de relatórios consolidados em formatos PDF.

## REQUISITOS FUNCIONAIS E NÃO FUNCIONAIS

### 1. REQUISITOS FUNCIONAIS (RFs)

* **RF01 - Gestão de Acesso e Autenticação:** O sistema deve permitir o cadastro, login via e-mail e senha ou integração com Google OAuth, recuperação de senha e encerramento de sessão do usuário.

* **RF02 - Gestão de Perfil:** O sistema deve permitir que o usuário consulte e altere seus dados cadastrais utilizados pelo sistema.

* **RF03 - Gestão de Contas Lógicas:** O sistema deve permitir o cadastro e gerenciamento de contas ou carteiras lógicas utilizadas para representar onde os recursos financeiros estão armazenados (ex.: Dinheiro, Nubank e Banco do Brasil), incluindo o registro do saldo inicial de cada conta.

* **RF04 - Categorização Financeira:** O sistema deve permitir o cadastro e a consulta de categorias utilizadas para classificar o fluxo financeiro em Entradas e Saídas.

* **RF05 - Gestão de Movimentações Financeiras:** O sistema deve permitir cadastrar, editar, excluir e consultar movimentações financeiras de receitas e despesas, vinculando cada movimentação a uma Conta Lógica e a uma Categoria.

* **RF06 - Filtros e Histórico:** O sistema deve permitir consultar, filtrar e obter resumos das movimentações financeiras por período, categoria, conta e tipo de movimentação.

* **RF07 - Gestão de Gastos Fixos Recorrentes:** O sistema deve permitir cadastrar despesas mensais recorrentes, como aluguel e assinaturas, informando o dia de vencimento e permitindo controlar seu status como ativo ou inativo, sem eliminar o histórico já registrado.

* **RF08 - Acompanhamento de Metas Financeiras:** O sistema deve permitir cadastrar metas de poupança informando valor objetivo, valor acumulado e data limite, além de apresentar o progresso do usuário em relação a cada meta.

* **RF09 - Controle de Compras Parceladas/Grandes:** O sistema deve permitir registrar e acompanhar compras de grande porte ou parceladas, armazenando o valor total da compra, o valor já pago, o saldo restante e o prazo estimado para quitação.

* **RF10 - Simulação de Gastos Futuros:** O sistema deve disponibilizar uma funcionalidade de projeção que simule o saldo futuro do usuário considerando o saldo atual, os gastos fixos ativos e as parcelas de compras em aberto. A simulação não deve alterar as movimentações ou saldos reais armazenados no sistema.

* **RF11 - Exibição de Insights Educativos:** O sistema deve apresentar mensagens e orientações de educação financeira relacionadas aos hábitos financeiros do usuário, com dicas de gestão e consumo consciente exibidas na interface.

### 2. REQUISITOS NÃO FUNCIONAIS (RNFs)

* **RNF01 - Criptografia de Dados Sensíveis:** As senhas dos usuários devem ser armazenadas utilizando algoritmo de hash seguro (ex.: bcrypt). O sistema não deve armazenar senhas em texto puro, nem solicitar ou armazenar credenciais bancárias reais de serviços financeiros externos.

* **RNF02 - Comunicação Segura:** O sistema deve utilizar protocolo HTTPS em ambiente de produção para garantir o tráfego seguro de dados entre cliente e servidor.

* **RNF03 - Padronização de API REST:** A comunicação entre o front-end e o back-end deve ser feita via API RESTful utilizando o formato JSON para troca de dados.

* **RNF04 - Desempenho e Tempo de Resposta:** A API deve responder às requisições comuns em tempo inferior a 1 segundo sob condições normais de uso, desconsiderando operações que dependam de serviços externos ou processamento pesado.

* **RNF05 - Validação e Integridade de Dados:** O sistema deve validar todos os dados recebidos antes da persistência no banco e garantir a integridade dos valores numéricos e financeiros, evitando registros inválidos ou inconsistentes.

* **RNF06 - Tratamento de Erros:** O sistema deve possuir tratamento centralizado de exceções, retornando mensagens claras e códigos de status HTTP adequados para cada tipo de erro.

* **RNF07 - Arquitetura Modular:** O código do back-end e front-end deve ser organizado de forma modular, com separação adequada de responsabilidades, para facilitar a manutenção e a escalabilidade.

* **RNF08 - Backup e Disponibilidade:** O banco de dados deve possuir rotinas periódicas de backup para evitar a perda do histórico financeiro e permitir a recuperação das informações em caso de falha.

* **RNF09 - Proteção de Dados Pessoais (LGPD):** O sistema deve implementar medidas técnicas e administrativas para proteger os dados pessoais e financeiros dos usuários contra acesso não autorizado, perda, alteração, destruição ou divulgação indevida, observando os princípios e requisitos aplicáveis da LGPD.

* **RNF10 - Minimização de Dados (LGPD):** O sistema deve coletar e armazenar somente os dados pessoais necessários para executar suas funcionalidades, evitando a coleta de informações que não possuam finalidade definida no sistema.

* **RNF11 - Transparência no Tratamento de Dados (LGPD):** O sistema deve informar ao usuário, de forma clara e acessível, quais dados pessoais são coletados, a finalidade de seu uso e como esses dados são tratados pelo sistema.

* **RNF12 - Controle dos Dados pelo Usuário (LGPD):** O sistema deve disponibilizar mecanismos para que o usuário consulte e altere seus dados pessoais e, quando aplicável, exerça os direitos relacionados ao tratamento de seus dados previstos na LGPD.

* **RNF13 - Autenticação e Autorização:** O sistema deve utilizar mecanismos de autenticação e autorização para verificar a identidade do usuário e controlar o acesso aos recursos protegidos da aplicação.

* **RNF14 - Segurança de Configurações:** Informações sensíveis, como credenciais do banco de dados, chaves de API, segredos de autenticação e tokens, não devem ser armazenadas diretamente no código-fonte, devendo ser mantidas em configurações seguras, como variáveis de ambiente.

* **RNF15 - Acessibilidade por Teclado:** O sistema deve permitir que as funcionalidades disponíveis na interface possam ser utilizadas por meio do teclado, sem depender exclusivamente do uso do mouse.

* **RNF16 - Compatibilidade com Tecnologias Assistivas:** A interface deve ser desenvolvida de forma compatível com tecnologias assistivas, incluindo leitores de tela, utilizando elementos e informações que possam ser corretamente interpretados por essas tecnologias.

* **RNF17 - Legibilidade e Contraste:** O sistema deve utilizar textos, cores e contrastes que permitam a leitura adequada das informações, não utilizando apenas cores para transmitir informações importantes.

* **RNF18 - Responsividade e Redimensionamento da Interface:** O sistema deve adaptar-se automaticamente a interface para smartphones, tablets, notebooks e desktops, mantendo legibilidade, organização dos elementos e sem perda de funcionalidades.

* **RNF19 - Acessibilidade dos Formulários:** Os formulários devem possuir rótulos claros, identificação dos campos obrigatórios, ordem de navegação adequada e mensagens de erro compreensíveis para orientar o usuário durante o preenchimento.

* **RNF20 - Linguagem Clara:** As informações, mensagens, alertas e orientações apresentadas pelo sistema devem utilizar linguagem clara e compreensível, evitando termos técnicos desnecessários para o usuário final.

> **📌 Nota de Status e Versionamento do Projeto:**
> Este documento representa a versão atual (**V1**) do Descritivo Geral do Projeto Integrador.
>
> * **Estruturação Inicial:** As informações constantes neste relatório representam a estruturação do projeto até o presente momento, estando sujeitas a alterações, modificações e refatorações conforme o avanço das próximas etapas de desenvolvimento e dos ciclos quinzenais pré-determinados com a orientação.