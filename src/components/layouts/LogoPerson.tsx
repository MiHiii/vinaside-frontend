import { cn } from "@/lib/utils"

export function LogoPerson({ className }: { className?: string }) {
  return (
    <div className={cn(
      "w-10 h-10 rounded-full bg-black flex items-center justify-center",
      className
    )}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-6 h-6 text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
  )
}
