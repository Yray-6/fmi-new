"use client";

import { useId, useState } from "react";

const fieldClassName =
  "flex h-[52px] items-center justify-between gap-3 rounded-lg border border-[#D9E5DD] bg-white px-4 focus-within:border-accent";

const inputClassName =
  "min-w-0 flex-1 bg-transparent text-xs leading-6 text-[#14271F] outline-none placeholder:text-[#718078] lg:text-base";

export function TextField({
  label,
  type = "text",
  name,
  placeholder,
  autoComplete,
  required = true,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  name: string;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-semibold leading-[22px] text-[#14271F] lg:text-[15px]">
        {label}
      </label>
      <div className={fieldClassName}>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={
            onChange ? (event) => onChange(event.target.value) : undefined
          }
          className={inputClassName}
        />
      </div>
    </div>
  );
}

export function PasswordField({
  placeholder,
  autoComplete,
  hint,
  minLength,
  pattern,
  title,
  required = true,
}: {
  placeholder: string;
  autoComplete: string;
  hint?: string;
  minLength?: number;
  pattern?: string;
  title?: string;
  required?: boolean;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-semibold leading-[22px] text-[#14271F] lg:text-[15px]">
        Password
      </label>
      <div className={fieldClassName}>
        <input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          pattern={pattern}
          title={title}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="shrink-0"
        >
          <img
            src={visible ? "/auth/icon-eye-off.svg" : "/auth/icon-eye.svg"}
            alt=""
            width={20}
            height={20}
          />
        </button>
      </div>
      {hint ? (
        <p className="text-[13px] leading-[19px] text-[#53645B]">{hint}</p>
      ) : null}
    </div>
  );
}
