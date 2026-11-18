"use client";

// Flatpickr setup adapted from TailAdmin's MIT-licensed date picker.
// See docs/third-party-notices.md.
import flatpickr from "flatpickr";
import { Indonesian } from "flatpickr/dist/l10n/id";
import { useEffect, useRef, useState } from "react";

type Props = { id: string; name: string; label: string; required?: boolean; min?: string; optional?: boolean };

export default function DatePicker({ id, name, label, required = false, min, optional = false }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const instance = useRef<ReturnType<typeof flatpickr> | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = input.current;
    if (!element) return;
    const validate = () => {
      const value = element.value;
      let message = "";
      if (value) {
        const date = flatpickr.parseDate(value, "Y-m-d");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !date || flatpickr.formatDate(date, "Y-m-d") !== value) message = "Masukkan tanggal yang valid dengan format YYYY-MM-DD.";
        else if (min && value < min) message = "Tanggal tidak boleh sebelum " + min + ".";
      }
      element.setCustomValidity(message);
    };
    const picker = flatpickr(element, {
      mode: "single", static: true, monthSelectorType: "static", dateFormat: "Y-m-d",
      ariaDateFormat: "j F Y", locale: Indonesian, disableMobile: true, allowInput: true,
      minDate: min,
      onReady: (_, __, calendar) => {
        calendar.calendarContainer.id = `${id}-calendar`;
        calendar.calendarContainer.setAttribute("role", "dialog");
        calendar.calendarContainer.setAttribute("aria-label", `Kalender ${label.replace(/^Tanggal\s+/i, "").toLowerCase()}`);
      },
      onOpen: () => setOpen(true),
      onClose: () => { setOpen(false); validate(); },
      onChange: validate,
    });
    instance.current = picker;
    element.addEventListener("input", validate);
    const reset = () => { picker.clear(); element.setCustomValidity(""); };
    element.form?.addEventListener("reset", reset);
    const form = element.form;
    return () => {
      element.removeEventListener("input", validate);
      form?.removeEventListener("reset", reset);
      picker.destroy();
      instance.current = null;
    };
  }, [id, label, min]);

  return (
    <div className="food-datepicker-field" onKeyDownCapture={e => {
      if (e.key === "Escape" && open) {
        e.preventDefault(); e.stopPropagation();
        const picker = instance.current;
        if (picker && !Array.isArray(picker)) picker.close();
        input.current?.focus();
        if (picker && !Array.isArray(picker)) picker.close();
      }
    }}>
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}{optional && <span className="food-datepicker-optional"> (opsional)</span>}</label>
      <div className="food-datepicker">
        <input ref={input} id={id} name={name} type="text" className="food-datepicker-input" required={required} autoComplete="off" placeholder="YYYY-MM-DD" pattern="\d{4}-\d{2}-\d{2}" maxLength={10} aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-calendar`} />
        <svg className="food-datepicker-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 11h18M8 15h2m4 0h2m-8 3h2" /></svg>
      </div>
    </div>
  );
}
