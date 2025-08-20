export default function DivReact({ children, className }) {
  return (
    <div
      className={`border bg-white w-full flex-col items-start justify-between rounded-lg  p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
