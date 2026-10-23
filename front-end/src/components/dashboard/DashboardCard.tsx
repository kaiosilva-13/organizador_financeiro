import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  children: ReactNode;
  /** Ação opcional exibida no canto superior direito do card. */
  action?: ReactNode;
};

function DashboardCard({ title, children, action }: DashboardCardProps) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-black">{title}</h3>
        {action}
      </div>

      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

export default DashboardCard;
