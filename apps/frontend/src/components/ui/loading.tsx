import { cn } from "@/lib/utils";

export const Loading = ({ size = "sm" }: { size?: "md" | "sm" }) => {
  return (
    <div className="flex items-center justify-center">
      <svg
        className={cn(
          "animate-spin mr-3 -ml-1  text-gray-900",
          size == "md" && "h-10 w-10",
          size == "sm" && "h-5 w-5"
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export const LoadingPage = () => {
  return (
    <div className="flex h-full w-full align-middle justify-center items-center">
      <Loading size="md" />
    </div>
  );
};
