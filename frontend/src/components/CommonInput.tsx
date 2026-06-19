import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import "./CommonInput.css";

interface CommonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  showPasswordToggle?: boolean;
}

export const CommonInput = ({
  label,
  error,
  hint,
  showPasswordToggle,
  type = "text",
  autoComplete,
  ...props
}: CommonInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  const autoCompleteMap: Record<string, string> = {
    email: "email",
    password: "current-password",
    "new-password": "new-password",
  };

  return (
    <div className="input-wrapper">
      {label && <label htmlFor={props.id}>{label}</label>}

      <div className="input-container">
        <input
          {...props}
          type={inputType}
          autoComplete={autoCompleteMap[type] || autoComplete}
          className={`input ${error ? "input--error" : ""}`}
          aria-label={label || props.placeholder}
          aria-describedby={error ? `${props.id}-error` : undefined}
          aria-required={props.required}
        />

        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            className="input-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar" : "Mostrar"}
            tabIndex={0}
          >
            {showPassword ? "👁️‍🗨️" : "👁️"}
          </button>
        )}
      </div>

      {error && (
        <span className="input-error" id={`${props.id}-error`}>
          {error}
        </span>
      )}
      {hint && <span className="input-hint">{hint}</span>}
    </div>
  );
};
