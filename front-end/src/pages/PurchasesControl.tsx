import { useCallback, useEffect, useMemo, useState } from "react";

import { AlertCircle, Loader2, Plus } from "lucide-react";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import DeletePurchaseModal from "../components/purchases/DeletePurchaseModal";
import PayInstallmentModal from "../components/purchases/PayInstallmentModal";
import PurchaseEmptyState from "../components/purchases/PurchaseEmptyState";
import PurchaseFormModal from "../components/purchases/PurchaseFormModal";
import PurchaseInstallmentsTable from "../components/purchases/PurchaseInstallmentsTable";
import PurchaseSummaryCard from "../components/purchases/PurchaseSummaryCard";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { formatCurrency } from "../lib/currency";
import { DASHBOARD_NAV_ITEMS } from "../lib/navigation";
import {
  createPurchase,
  deletePurchase,
  fetchPurchases,
  payPurchaseInstallment,
} from "../lib/purchasesApi";
import { API_URL } from "../services/api";
import type { Account } from "../types/account";
import type {
  InstallmentPaymentInput,
  Purchase,
  PurchaseFormInput,
  PurchaseInstallment,
} from "../types/purchase";

function PurchasesControl() {
  const userName = useAuthenticatedUser();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [accounts, setAccounts] = useState<Account[]>([]);
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
    let isMounted = true;

    async function loadPurchases() {
      try {
        const data = await fetchPurchases();

        if (isMounted) {
          setPurchases(data);
          setSelectedPurchaseId(data[0]?.id ?? null);
          setLoadError("");
        }
      } catch (error) {
        console.error("Erro ao carregar as compras:", error);

        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as compras.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPurchases();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAccounts() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
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

        if (isMounted) {
          setAccounts([]);
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

  const handleCreatePurchase = useCallback(
    async (input: PurchaseFormInput) => {
      // Lança erro em caso de falha: o modal exibe a mensagem ao usuário.
      const purchase = await createPurchase(input);

      setPurchases((currentPurchases) => [purchase, ...currentPurchases]);
      setSelectedPurchaseId(purchase.id);
      setIsFormModalOpen(false);
      setFeedback(`Compra "${purchase.name}" cadastrada com sucesso.`);
    },
    [],
  );

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
    async (input: InstallmentPaymentInput) => {
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
      const result = await payPurchaseInstallment(
        purchase.id,
        installment.id,
        input,
      );

      setPurchases((currentPurchases) =>
        currentPurchases.map((currentPurchase) =>
          currentPurchase.id === result.purchase.id
            ? result.purchase
            : currentPurchase,
        ),
      );

      setAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount.id === result.accountId
            ? { ...currentAccount, balance: result.accountBalance }
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

  const handleConfirmDelete = useCallback(async () => {
    const purchase = selectedPurchase;

    if (!purchase) {
      return;
    }

    // Lança erro em caso de falha: a modal exibe a mensagem ao usuário.
    await deletePurchase(purchase.id);

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
      <DashboardNavbar
        items={DASHBOARD_NAV_ITEMS}
        activeKey="purchases"
        userName={userName}
      />

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
          {isLoading ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-16 text-sm text-slate-500 shadow-sm"
            >
              <Loader2 size={18} aria-hidden="true" className="animate-spin" />
              Carregando compras...
            </div>
          ) : loadError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
            >
              <AlertCircle
                size={17}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              <span>{loadError}</span>
            </div>
          ) : selectedPurchase ? (
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