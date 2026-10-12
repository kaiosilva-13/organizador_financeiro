import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  children: ReactNode;
};

function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-black">{title}</h3>

      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

export default DashboardCard;
