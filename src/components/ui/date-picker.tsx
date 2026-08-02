"use client";

import { useState, useRef, useEffect } from "react";
import { format, parse, isValid, parseISO } from "date-fns";
import { Calendar } from "lucide-react";

interface CustomDatePickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function CustomDatePicker({ value, onChange, className = "", required = false }: CustomDatePickerProps) {
  const [textValue, setTextValue] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const parsedDate = parseISO(value);
      if (isValid(parsedDate)) {
        setTextValue(format(parsedDate, "dd/MM/yyyy"));
      }
    } else {
      setTextValue("");
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except digits
    let digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    
    // Format as dd/mm/yyyy
    let val = digits;
    if (digits.length > 2) {
      val = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length > 4) {
      val = `${val.slice(0, 5)}/${digits.slice(4)}`;
    }

    setTextValue(val);

    if (val.length === 10) {
      const parsed = parse(val, "dd/MM/yyyy", new Date());
      if (isValid(parsed)) {
        onChange(format(parsed, "yyyy-MM-dd"));
      }
    } else if (val === "") {
      onChange("");
    }
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value; // yyyy-mm-dd
    if (rawValue) {
      onChange(rawValue);
      setTextValue(format(parseISO(rawValue), "dd/MM/yyyy"));
    } else {
      onChange("");
      setTextValue("");
    }
  };

  const openPicker = () => {
    if (dateInputRef.current) {
      try {
        if ('showPicker' in HTMLInputElement.prototype) {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      } catch (err) {}
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <input
        type="text"
        placeholder="dd/mm/yyyy"
        value={textValue}
        onChange={handleTextChange}
        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] outline-none focus:border-amber-500 text-slate-700 font-mono tracking-wider placeholder:tracking-normal"
        required={required}
      />
      <button 
        type="button" 
        onClick={openPicker}
        className="absolute right-1 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-amber-600 transition-colors"
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>
      
      {/* Hidden Native Picker */}
      <input
        ref={dateInputRef}
        type="date"
        value={value || ""}
        onChange={handleDateSelect}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
  );
}
