type InsightDecorProps = {
  insightId: number;
};

/**
 * Arcos decorativos de fundo dos cartões de insight.
 *
 * A posição varia entre três composições para que os cartões não fiquem
 * visualmente repetitivos, mantendo sempre a mesma linguagem discreta.
 */
const decorLayouts = [
  {
    outer: "top-[-62%] right-[-8%] h-[180%] w-[72%]",
    middle: "top-[-34%] right-[-26%] h-[150%] w-[82%]",
    inner: "bottom-[-34%] left-[-24%] h-[82%] w-[50%]",
  },
  {
    outer: "top-[-48%] right-[-18%] h-[165%] w-[68%]",
    middle: "top-[-20%] right-[-34%] h-[135%] w-[78%]",
    inner: "bottom-[-42%] right-[-6%] h-[92%] w-[44%]",
  },
  {
    outer: "top-[-70%] right-[-20%] h-[190%] w-[76%]",
    middle: "top-[-45%] right-[-40%] h-[155%] w-[86%]",
    inner: "bottom-[-22%] left-[-38%] h-[85%] w-[50%]",
  },
] as const;

function InsightDecor({ insightId }: InsightDecorProps) {
  const layout = decorLayouts[(insightId - 1) % decorLayouts.length];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={`absolute rounded-full border border-white/10 ${layout.outer}`}
      />
      <div
        className={`absolute rounded-full border border-white/[0.07] ${layout.middle}`}
      />
      <div
        className={`absolute rounded-full border border-white/[0.05] ${layout.inner}`}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255, 255, 255, 0.12), transparent 55%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, transparent 38%, rgba(0, 0, 0, 0.10))",
        }}
      />
    </div>
  );
}

export default InsightDecor;
