export function InputField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-600">
        {label}
      </label>
      {children}
    </div>
  );
}
