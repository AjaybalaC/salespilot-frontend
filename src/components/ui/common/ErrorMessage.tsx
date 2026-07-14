interface Props {
  message?: string;
}

export default function ErrorMessage({
  message,
}: Props) {
  if (!message) return null;

  return (
    <div className="rounded bg-red-100 p-3 text-red-600">
      {message}
    </div>
  );
}