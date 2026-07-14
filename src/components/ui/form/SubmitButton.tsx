import { Loader2 } from "lucide-react";

interface Props {
  loading?: boolean;
  children: React.ReactNode;
}

export default function SubmitButton({
  loading,
  children,
}: Props) {
  return (
    <button
      disabled={loading}
      className="w-full rounded-lg bg-blue-600 py-3 text-white"
    >
      {loading ? (
        <Loader2 className="mx-auto animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}