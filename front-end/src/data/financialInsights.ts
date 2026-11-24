export type FinancialInsight = {
  id: number;
  title: string;
  summary: string;
  description: string;
  practice: string;
  /** Cor inicial do gradiente exclusivo do cartão. */
  colorFrom: string;
  /** Cor final do gradiente exclusivo do cartão. */
  colorTo: string;
};

/** Quantidade de cartões exibidos por página na grade. */
export const FINANCIAL_INSIGHTS_PER_PAGE = 6;

/**
 * Catálogo de conceitos de educação financeira da seção Insights.
 *
 * O resumo é exibido no cartão fechado. A descrição completa e a orientação
 * prática são exibidas na modal de detalhes.
 */
export const FINANCIAL_INSIGHTS: FinancialInsight[] = [
  {
    id: 1,
    title: "Anote o que você ganha e o que gasta",
    summary:
      "Registre entradas e despesas para entender para onde o dinheiro vai e se você gasta mais do que recebe.",
    description:
      "Registre suas entradas e despesas ao longo do mês. Vale anotar desde o salário e a renda extra até as compras pequenas, as contas e as parcelas. No fim do mês, fica mais fácil perceber para onde o dinheiro está indo e se você está gastando mais do que recebe.",
    practice:
      "Para começar: confira o extrato bancário e a fatura do cartão. Depois, separe os gastos por tipo, como alimentação, transporte e moradia.",
    colorFrom: "#6B45F0",
    colorTo: "#5328ED",
  },
  {
    id: 2,
    title: "Tenha em mente as despesas que não aparecem todo mês",
    summary:
      "Planeje também os gastos de certas épocas do ano, como IPVA e matrícula, para evitar surpresas.",
    description:
      "Algumas contas se repetem, como aluguel e mensalidades. Outras variam, como água e energia. Também existem gastos que aparecem só em determinadas épocas do ano, como IPVA, matrícula e material escolar. Se eles forem esquecidos, podem apertar o orçamento quando chegarem.",
    practice:
      "Uma boa ideia é olhar os gastos dos últimos meses e guardar um pouco por mês para essas despesas.",
    colorFrom: "#2B7A63",
    colorTo: "#0A6448",
  },
  {
    id: 3,
    title: "Veja se o dinheiro está sobrando ou faltando",
    summary:
      "Subtraia as despesas das receitas e busque um resultado positivo, mesmo que a sobra seja pequena.",
    description:
      "Depois de anotar receitas e despesas, faça a conta: quanto entrou menos quanto saiu. Se sobrou dinheiro, houve superávit; se os gastos passaram da renda, houve déficit. O ideal é buscar um resultado positivo, mesmo que a sobra seja pequena no começo.",
    practice: "Conta simples: resultado do mês = receitas - despesas.",
    colorFrom: "#35598B",
    colorTo: "#163D77",
  },
  {
    id: 4,
    title: "Descubra quais gastos podem ser reduzidos",
    summary:
      "Separe gastos por categoria e identifique desperdícios. A ideia não é cortar tudo, mas fazer ajustes possíveis.",
    description:
      "Separar as despesas por categoria ajuda a enxergar onde o dinheiro está sendo usado. Observe o que é essencial, o que é apenas um desejo e o que acaba sendo desperdício - por exemplo, pagar por um serviço que você nem utiliza. A ideia não é cortar tudo, mas evitar gastos que não fazem diferença no seu dia a dia.",
    practice:
      "Escolha uma categoria que pesa no orçamento e pense em um ajuste que seja possível manter.",
    colorFrom: "#A85F4D",
    colorTo: "#974532",
  },
  {
    id: 5,
    title: "Transforme seus planos em metas",
    summary:
      "Defina o valor do seu objetivo, o prazo e quanto precisa guardar por mês para realizá-lo.",
    description:
      "Se você quer comprar algo, fazer uma viagem ou quitar uma dívida, coloque esse objetivo no papel. Defina quanto precisa, em quanto tempo pretende conseguir e quanto deve guardar por mês. Assim, o plano deixa de ser apenas uma vontade e passa a ter um caminho.",
    practice:
      "Divida o valor que falta pelo número de meses até a data desejada. Esse será o valor mensal que você precisa tentar reservar.",
    colorFrom: "#96722F",
    colorTo: "#815A12",
  },
  {
    id: 6,
    title: "Pense se é necessidade ou vontade",
    summary:
      "Antes de comprar, avalie se é uma necessidade, se pode esperar e se cabe no seu orçamento.",
    description:
      "Nem tudo o que queremos precisa ser comprado na hora. Necessidades são coisas importantes para o dia a dia; desejos podem esperar ou ser substituídos. Antes de passar o cartão, vale pensar se aquela compra é realmente prioridade e se vai fazer falta no orçamento.",
    practice:
      "Pergunte a si mesmo: preciso disso agora ou posso esperar um pouco?",
    colorFrom: "#445166",
    colorTo: "#323F55",
  },
  {
    id: 7,
    title: "Não compre só porque está em promoção",
    summary:
      "Uma promoção só vale a pena se o produto for útil, fizer sentido para você e couber no orçamento.",
    description:
      "Descontos, anúncios e até a vontade de acompanhar outras pessoas podem levar a compras que nem estavam nos planos. Antes de decidir, veja se o produto será útil e se o valor cabe no seu orçamento. Uma promoção só é vantajosa quando você realmente precisa ou quer aquilo e pode pagar.",
    practice:
      "Para compras que não são essenciais, espere um dia ou alguns dias antes de decidir.",
    colorFrom: "#804894",
    colorTo: "#6D3085",
  },
  {
    id: 8,
    title: "Olhe o valor total, não só o tamanho da parcela",
    summary:
      "Some todas as parcelas, confira juros e cobranças e compare o custo total com o preço à vista.",
    description:
      "Uma prestação pequena pode parecer fácil de pagar, mas várias parcelas juntas comprometem boa parte da renda dos próximos meses. Antes de fechar a compra, some todas as prestações e compare o resultado com o preço à vista. Confira também se há juros e outras cobranças.",
    practice:
      "Multiplique o valor da parcela pelo número de parcelas e compare com o preço à vista.",
    colorFrom: "#2E7582",
    colorTo: "#11606E",
  },
  {
    id: 9,
    title: "Planeje as compras e evite desperdício em casa",
    summary:
      "Faça uma lista, confira o que já tem e reveja o consumo e os serviços que quase não utiliza.",
    description:
      "Fazer uma lista antes de ir ao mercado e conferir o que já tem em casa ajuda a não comprar produtos repetidos ou deixar alimentos vencerem. Também vale observar o consumo de água e energia e cancelar serviços que quase não são usados.",
    practice:
      "Confira a despensa, planeje as refeições e reveja assinaturas que não fazem mais sentido.",
    colorFrom: "#50629F",
    colorTo: "#34478D",
  },
  {
    id: 10,
    title: "Lembre que toda escolha tem um custo",
    summary:
      "Ao gastar em uma compra, pense no que precisará adiar e em quais objetivos podem ser afetados.",
    description:
      "Quando você usa dinheiro em uma compra, deixa de poder usar aquele mesmo valor em outra coisa. Talvez seja preciso adiar uma viagem, guardar menos ou demorar mais para quitar uma dívida. Por isso, vale pensar não só no que você ganha com a compra, mas também no que terá de deixar para depois.",
    practice:
      "Antes de gastar, pense em qual objetivo pode acabar sendo adiado.",
    colorFrom: "#617C4E",
    colorTo: "#486630",
  },
  {
    id: 11,
    title: "Compare o Custo Efetivo Total (CET)",
    summary:
      "O CET reúne juros, tarifas, impostos e encargos e ajuda a comparar o custo real do crédito.",
    description:
      "Ao contratar um empréstimo ou financiamento, não olhe apenas a taxa de juros anunciada. O Custo Efetivo Total (CET) reúne juros, tarifas, impostos e outros encargos. É ele que ajuda a mostrar quanto a operação realmente vai custar.",
    practice:
      "Peça o CET de mais de uma instituição e compare propostas com o mesmo valor e prazo.",
    colorFrom: "#307C74",
    colorTo: "#11675E",
  },
  {
    id: 12,
    title: "Entenda como funcionam os juros compostos",
    summary:
      "Juros sobre juros podem aumentar dívidas ou ajudar investimentos quando os rendimentos ficam aplicados.",
    description:
      "Nos juros compostos, os juros são somados ao saldo e passam a gerar novos juros nos períodos seguintes. Isso pode fazer uma dívida crescer bastante quando não é paga em dia. Por outro lado, nos investimentos, o mesmo efeito pode ajudar o dinheiro a crescer quando os rendimentos ficam aplicados.",
    practice:
      "Ao avaliar uma dívida ou investimento, confira a taxa, o prazo e a frequência de cálculo dos juros.",
    colorFrom: "#9A4E73",
    colorTo: "#862D59",
  },
  {
    id: 13,
    title: "Não trate o limite do cartão como parte do salário",
    summary:
      "O limite é crédito, não renda extra. Acompanhe o que já está comprometido nas próximas faturas.",
    description:
      "O limite do cartão é um crédito oferecido pelo banco, não dinheiro extra. Cada compra feita nele será cobrada depois, inclusive as parceladas. Por isso, é importante acompanhar o que já está comprometido nas próximas faturas antes de fazer novas compras.",
    practice:
      "Anote as compras no cartão e considere o valor total delas no seu planejamento.",
    colorFrom: "#5A5F93",
    colorTo: "#3F447E",
  },
  {
    id: 14,
    title: "Pague a fatura inteira e até o vencimento",
    summary:
      "Pagar só parte da fatura ou atrasar pode gerar juros e encargos. Planeje o pagamento integral em dia.",
    description:
      "Quando você paga só uma parte da fatura, o restante pode entrar no financiamento do cartão e gerar juros e encargos. O atraso também pode trazer custos extras. Sempre que possível, organize as contas para pagar o valor total na data certa.",
    practice:
      "Ative um lembrete alguns dias antes do vencimento e confira o valor da fatura.",
    colorFrom: "#587C67",
    colorTo: "#436953",
  },
  {
    id: 15,
    title: "Organize suas dívidas antes de negociar",
    summary:
      "Liste saldos, parcelas, vencimentos e juros para avaliar prioridades e propostas que cabem no orçamento.",
    description:
      "Coloque no papel todas as dívidas: para quem deve, quanto falta pagar, valor das parcelas, vencimentos e juros. Com essas informações, fica mais fácil decidir qual precisa de atenção primeiro e avaliar uma negociação. Antes de aceitar uma nova proposta, confira se o valor final realmente compensa e cabe no orçamento.",
    practice:
      "Compare o saldo, o CET, o prazo e o total que será pago ao final.",
    colorFrom: "#7A5529",
    colorTo: "#826037",
  },
  {
    id: 16,
    title: "Guarde uma parte do dinheiro assim que receber",
    summary:
      "Se possível, separe uma quantia ao receber, sem comprometer despesas essenciais, e mantenha a frequência.",
    description:
      "Deixar para poupar só o que sobrar no fim do mês nem sempre funciona. Se possível, separe uma quantia logo depois de receber e inclua esse valor no orçamento. Não precisa começar com muito: o importante é escolher uma quantia que não atrapalhe as despesas essenciais e manter a frequência.",
    practice:
      "Se ajudar, programe uma transferência automática para o dia em que receber.",
    colorFrom: "#66599F",
    colorTo: "#4B3D8E",
  },
  {
    id: 17,
    title: "Monte uma reserva para imprevistos",
    summary:
      "Guarde para situações inesperadas. O tamanho da reserva depende dos gastos, da renda e das responsabilidades.",
    description:
      "A reserva de emergência serve para situações inesperadas, como um conserto urgente ou um período sem renda. Ter esse dinheiro guardado pode evitar que você precise recorrer a empréstimos em um momento difícil. O tamanho da reserva depende dos seus gastos essenciais, da estabilidade da renda e das responsabilidades que você tem.",
    practice:
      "Calcule seus gastos essenciais por mês e multiplique pelo número de meses que gostaria de conseguir cobrir.",
    colorFrom: "#9C575B",
    colorTo: "#873A40",
  },
  {
    id: 18,
    title: "Antes de investir, avalie prazo, risco e facilidade de resgate",
    summary:
      "Considere liquidez, risco e retorno esperado. Não escolha uma aplicação só pela promessa de rendimento.",
    description:
      "Cada investimento tem características diferentes. A liquidez mostra com que facilidade você consegue resgatar o dinheiro; o risco está ligado à possibilidade de perdas ou oscilações; e a rentabilidade é o retorno esperado. Não escolha uma aplicação apenas porque ela promete render mais.",
    practice:
      "Pense em quando vai precisar do dinheiro e procure opções compatíveis com esse prazo e com o risco que aceita correr.",
    colorFrom: "#115F78",
    colorTo: "#246C83",
  },
  {
    id: 19,
    title: "Comece a poupar e mantenha a regularidade",
    summary:
      "Escolha um valor mensal que consiga manter e acompanhe o crescimento da sua poupança ao longo do tempo.",
    description:
      "Guardar um pouco todos os meses pode fazer diferença ao longo do tempo. Quando os rendimentos permanecem investidos, os juros compostos podem ajudar o saldo a crescer. Mais importante do que começar com uma quantia alta é encontrar um valor que você consiga manter.",
    practice:
      "Defina um valor mensal possível e acompanhe a evolução do que conseguiu juntar. Lembre-se de que nenhum rendimento é garantido.",
    colorFrom: "#646D7B",
    colorTo: "#505B6A",
  },
  {
    id: 20,
    title: "Cuide dos seus dados e desconfie de promessas fáceis",
    summary:
      "Desconfie de ganhos fáceis, confira a instituição e nunca compartilhe senhas ou códigos recebidos.",
    description:
      "Ofertas que prometem ganhos muito altos, rápidos e sem risco merecem atenção. Antes de contratar qualquer serviço financeiro, confira se a instituição é confiável e leia as condições. Nunca compartilhe senhas ou códigos recebidos por mensagem e evite acessar o banco por links suspeitos.",
    practice:
      "Use os canais oficiais da instituição e consulte os canais do Banco Central para verificar informações.",
    colorFrom: "#605B89",
    colorTo: "#474175",
  },
];
