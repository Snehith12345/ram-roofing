export default function Input({ label, id, error, className = "", inputClassName = "", ...rest }) {
  const inputId = id || rest.name;
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      ) : null}
      <input id={inputId} className={`input-field ${inputClassName}`.trim()} {...rest} />
      {error ? <span className="text-red-600 text-sm mt-1 block">{error}</span> : null}
    </div>
  );
}
