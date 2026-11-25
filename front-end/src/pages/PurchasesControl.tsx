import { useCallback, useEffect, useMemo, useState } from "react";

import { Plus } from "lucide-react";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import DeletePurchaseModal from "../components/purchases/DeletePurchaseModal";
import PayInstallmentModal from "../components/purchases/PayInstallmentModal";
import PurchaseEmptyState from "../components/purchases/PurchaseEmptyState";
import PurchaseFormModal from "../components/purchases/PurchaseFormModal";
import PurchaseInstallmentsTable from "../components/purchases/PurchaseInstallmentsTable";
import PurchaseSummaryCard from "../components/purchases/PurchaseSummaryCard";
import { formatCurrency } from "../lib/currency";
import { DASHBOARD_NAV_ITEMS } from "../lib/navigation";
import { buildPurchase } from "../lib/purchases";
import { API_URL } from "../services/api";
import type { Account } from "../types/account";
import type {
  InstallmentPaymentInput,
  Purchase,
  PurchaseFormInput,
  PurchaseInstallment,
} from "../types/purchase";

/**
 * Contas de demonstração usadas apenas quando não há sessão válida.
 *
 * O acesso a esta rota está liberado temporariamente para testes de front-end,
 * então o fluxo de pagamento precisa de contas para simular o débito.
 *
 * TODO [BACKEND / AUTH]: Remover este fallback quando o bloqueio de
 * autenticação for reativado e carregar somente as contas do usuário logado.
 */
const DEMO_ACCOUNTS: Account[] = [
  {
    id: "demo-conta-nubank",
    name: "Conta banco Nubank",
    type: "Conta Corrente",
    balance: 1250,
  },
  {
    id: "demo-carteira",
    name: "Carteira",
    type: "Dinheiro (Espécie)",
    balance: 480,
  },
];

/**
 * Persistência provisória no navegador para manter o fluxo testável entre
 * recarregamentos. Deve ser substituída pela API quando o back-end expuser os
 * endpoints de compras.
 */
const PURCHASES_STORAGE_KEY = "organizae:purchases";

function isStoredPurchase(value: unknown): value is Purchase {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Purchase>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.totalAmount === "number" &&
    typeof candidate.startDate === "string" &&
    typeof candidate.endDate === "string" &&
    Array.isArray(candidate.installments)
  );
}

function loadStoredPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem(PURCHASES_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter(isStoredPurchase) : [];
  } catch {
    return [];
  }
}

/**
 * Página de Controle de Compras.
 *
 * Nesta primeira versão todo o fluxo (cadastro, cronograma, pagamento e
 * exclusão) roda no front-end e é persistido em localStorage, conforme o
 * escopo de validação visual. Os pontos de integração com o back-end estão
 * marcados com `TODO [BACKEND]` ao longo do arquivo e dos componentes.
 */
function PurchasesControl() {
  // TODO [BACKEND]: Substituir estado local por chamada GET /api/purchases para carregar as compras parceladas e seus cronogramas do banco de dados.
  const [purchases, setPurchases] = useState<Purchase[]>(loadStoredPurchases);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    () => purchases[0]?.id ?? null,
  );

  const [accounts, setAccounts] = useState<Account[]>(DEMO_ACCOUNTS);
  const [feedback, setFeedback] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [payingInstallment, setPayingInstallment] =
    useState<PurchaseInstallment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedPurchase = useMemo(
    () =>
      purchases.find((purchase) => purchase.id === selectedPurchaseId) ??
      purchases[0] ??
      null,
    [purchases, selectedPurchaseId],
  );

  useEffect(() => {
    try {
      localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchases));
    } catch (error) {
      console.error("Não foi possível salvar as compras localmente:", error);
    }
  }, [purchases]);

  useEffect(() => {
    let isMounted = true;

    async function loadAccounts() {
      const token = localStorage.getItem("access_token");

      // Acesso provisório sem login: mantém as contas de demonstração.
      if (!token) {
        if (isMounted) {
          setAccounts(DEMO_ACCOUNTS);
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          /*
           * Acesso provisório: um token expirado não deve expulsar o testador
           * para o login. Removemos o token inválido e seguimos com as contas
           * de demonstração.
           *
           * TODO [BACKEND / AUTH]: redirecionar para /login quando a
           * autenticação for reativada.
           */
          localStorage.removeItem("access_token");

          if (isMounted) {
            setAccounts(DEMO_ACCOUNTS);
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar as contas financeiras.");
        }

        const data: Account[] = await response.json();

        if (isMounted) {
          setAccounts(
            data.map((account) => ({
              ...account,
              id: String(account.id),
              balance: Number(account.balance),
            })),
          );
        }
      } catch (error) {
        console.error("Erro ao carregar contas do Controle de Compras:", error);

        // Mantém as contas de demonstração para não interromper os testes.
        if (isMounted) {
          setAccounts(DEMO_ACCOUNTS);
        }
      }
    }

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(""), 4500);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleOpenCreateModal = useCallback(() => {
    setIsFormModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsFormModalOpen(false);
  }, []);

  const handleCreatePurchase = useCallback((input: PurchaseFormInput) => {
    // TODO [BACKEND]: Conectar endpoint POST /api/purchases para persistir a nova compra e gerar automaticamente as parcelas no banco de dados.
    const purchase = buildPurchase(input);

    setPurchases((currentPurchases) => [purchase, ...currentPurchases]);
    setSelectedPurchaseId(purchase.id);
    setIsFormModalOpen(false);
    setFeedback(`Compra "${purchase.name}" cadastrada com sucesso.`);
  }, []);

  const handleSwitchPurchase = useCallback(() => {
    if (purchases.length < 2) {
      return;
    }

    const currentIndex = purchases.findIndex(
      (purchase) => purchase.id === selectedPurchase?.id,
    );
    const nextIndex = (currentIndex + 1) % purchases.length;

    setSelectedPurchaseId(purchases[nextIndex]?.id ?? null);
  }, [purchases, selectedPurchase]);

  const handleOpenPaymentModal = useCallback(
    (installment: PurchaseInstallment) => {
      setPayingInstallment(installment);
    },
    [],
  );

  const handleClosePaymentModal = useCallback(() => {
    setPayingInstallment(null);
  }, []);

  const handlePayInstallment = useCallback(
    (input: InstallmentPaymentInput) => {
      const purchase = selectedPurchase;
      const installment = payingInstallment;

      if (!purchase || !installment) {
        throw new Error("Selecione uma prestação para registrar o pagamento.");
      }

      if (installment.status === "paid") {
        throw new Error("Esta parcela já foi paga.");
      }

      const account = accounts.find(
        (currentAccount) => currentAccount.id === input.accountId,
      );

      if (!account) {
        throw new Error("Selecione uma conta financeira válida.");
      }

      /*
       * Atualização otimista apenas no front-end. O endpoint dedicado será a
       * fonte da verdade e deverá executar as quatro etapas descritas no TODO
       * de PayInstallmentModal.tsx de forma atômica.
       *
       * `input.paidAt` é a data atual em que o pagamento foi confirmado (não o
       * vencimento da parcela); o servidor deve persistir esse valor em
       * `paid_at` junto com a movimentação gerada.
       */
      setPurchases((currentPurchases) =>
        currentPurchases.map((currentPurchase) => {
          if (currentPurchase.id !== purchase.id) {
            return currentPurchase;
          }

          return {
            ...currentPurchase,
            installments: currentPurchase.installments.map((currentInstallment) =>
              currentInstallment.id === installment.id
                ? {
                    ...currentInstallment,
                    status: "paid",
                    paidAt: input.paidAt,
                    accountId: account.id,
                    accountName: account.name,
                    receiptName: input.receiptFile?.name ?? null,
                  }
                : currentInstallment,
            ),
          };
        }),
      );

      setAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount.id === account.id
            ? {
                ...currentAccount,
                balance: currentAccount.balance - installment.amount,
              }
            : currentAccount,
        ),
      );

      setPayingInstallment(null);
      setFeedback(
        `Pagamento de ${formatCurrency(installment.amount)} registrado com sucesso.`,
      );
    },
    [accounts, payingInstallment, selectedPurchase],
  );

  const handleOpenDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    const purchase = selectedPurchase;

    if (!purchase) {
      return;
    }

    // TODO [BACKEND]: Conectar endpoint DELETE /api/purchases/:id para remover a compra e suas parcelas pendentes do banco de dados.
    const purchaseIndex = purchases.findIndex(
      (currentPurchase) => currentPurchase.id === purchase.id,
    );
    const remainingPurchases = purchases.filter(
      (currentPurchase) => currentPurchase.id !== purchase.id,
    );
    const nextIndex = Math.min(
      Math.max(purchaseIndex, 0),
      remainingPurchases.length - 1,
    );
    const nextPurchase =
      nextIndex >= 0 ? remainingPurchases[nextIndex] : null;

    setPurchases(remainingPurchases);
    setSelectedPurchaseId(nextPurchase?.id ?? null);
    setIsDeleteModalOpen(false);
    setFeedback(`Compra "${purchase.name}" excluída.`);
  }, [purchases, selectedPurchase]);

  return (
    <div className="min-h-svh bg-slate-50">
      <DashboardNavbar items={DASHBOARD_NAV_ITEMS} activeKey="purchases" />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Controle de compras
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Gerencie suas compras parceladas e acompanhe o progresso de cada
              prestação.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#4F26E9] px-4 text-sm font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99] sm:self-start"
          >
            <Plus size={17} aria-hidden="true" />
            Cadastrar compra
          </button>
        </header>

        {feedback && (
          <p className="sr-only" role="status" aria-live="polite">
            {feedback}
          </p>
        )}

        <div className="mt-8">
          {selectedPurchase ? (
            <div className="flex flex-col gap-5">
              <PurchaseSummaryCard
                purchase={selectedPurchase}
                onDelete={handleOpenDeleteModal}
                onSwitch={handleSwitchPurchase}
              />

              <PurchaseInstallmentsTable
                purchase={selectedPurchase}
                onPay={handleOpenPaymentModal}
              />
            </div>
          ) : (
            <PurchaseEmptyState onCreate={handleOpenCreateModal} />
          )}
        </div>
      </main>

      <PurchaseFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreatePurchase}
      />

      <PayInstallmentModal
        isOpen={Boolean(payingInstallment)}
        purchase={selectedPurchase}
        installment={payingInstallment}
        accounts={accounts}
        onClose={handleClosePaymentModal}
        onSubmit={handlePayInstallment}
      />

      <DeletePurchaseModal
        isOpen={isDeleteModalOpen}
        purchase={selectedPurchase}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default PurchasesControl;
