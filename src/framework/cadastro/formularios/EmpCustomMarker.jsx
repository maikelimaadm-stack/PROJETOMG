export default function EmpCustomMarker({ variant = "green" }) {
  const colorClass =
    variant === "white" ? "border-b-white" : variant === "lote" ? "border-b-[#2899f5]" : "border-b-[#2899f5]";
  return (
    <span
      className={`emp-custom-marker pointer-events-none absolute bottom-0 right-0 z-10 h-0 w-0 border-b-[7px] border-l-[7px] border-l-transparent ${colorClass}`}
    />
  );
}
