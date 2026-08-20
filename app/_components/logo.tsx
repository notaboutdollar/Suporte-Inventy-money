export function InventMoneyLogo({ size = 44 }: { size?: number }) {
  const fontSize = size * 0.24;
  return (
    <div
      aria-label="Invent Money"
      role="img"
      style={{
        width: size,
        height: size,
        background: "var(--color-accent)",
        borderRadius: Math.round(size * 0.22),
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        flex: "none",
        color: "#ffffff",
        fontFamily: "var(--font-heading)",
        fontWeight: 800,
        lineHeight: 0.92,
        letterSpacing: "-0.03em",
        fontSize,
        padding: `0 ${Math.round(size * 0.12)}px`,
      }}
    >
      <span>invent</span>
      <span>money</span>
    </div>
  );
}
