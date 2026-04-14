const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export default function Button({ children, type = "button", variant = "primary", className = "", disabled, ...rest }) {
  const v = variants[variant] || variants.primary;
  return (
    <button type={type} className={`${v} ${className}`.trim()} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
