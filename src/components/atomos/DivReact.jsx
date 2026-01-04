import { twMerge } from 'tailwind-merge';

export default function DivReact({ children, className, onClick }) {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        `border bg-white w-full flex-col items-start justify-between rounded-lg  px-4 py-2 shadow-sm ${className}`
      )}
    >
      {children}
    </div>
  );
}
