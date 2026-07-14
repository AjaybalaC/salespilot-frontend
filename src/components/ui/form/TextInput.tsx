interface Props
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function TextInput({
  label,
  error,
  ...props
}: Props) {
  return (
    <div className="space-y-2">
      <label>{label}</label>

      <input
        {...props}
        className="w-full rounded border p-3"
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}