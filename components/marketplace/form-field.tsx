import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"

const inputClass =
  "h-10 w-full border border-[rgba(55,50,47,0.14)] bg-white px-3 text-[13px] text-[#111] outline-none transition-colors duration-150 placeholder:text-[#bbb6ae] focus:border-[#111]"

export function FormField({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[8px] uppercase tracking-[0.14em] text-[#8a857e]">{label}</span>
      {children}
      {helper ? <span className="mt-1.5 block text-[10px] leading-4 text-[#a8a39c]">{helper}</span> : null}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className || ""}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} h-auto min-h-16 resize-none py-2 leading-5 ${props.className || ""}`} />
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} cursor-pointer ${props.className || ""}`} />
}
