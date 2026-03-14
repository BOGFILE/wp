
"use client";

import { cn } from "@/lib/utils";
import { AccountType } from "@/app/lib/account-types";

interface AccountCardProps {
  account: AccountType;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function AccountCard({ account, isSelected, onSelect }: AccountCardProps) {
  const renderIcon = () => {
    switch (account.id) {
      case "savings":
        return (
          <div className="w-12 h-12 flex items-center justify-center">
            <svg width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="24" width="24" height="4" rx="1" fill="#475569" />
              <path d="M6 24V11L16 3L26 11V24" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="9" y="14" width="2" height="10" fill="#94a3b8" />
              <rect x="15" y="14" width="2" height="10" fill="#94a3b8" />
              <rect x="21" y="14" width="2" height="10" fill="#94a3b8" />
              <path d="M6 11H26" stroke="#475569" strokeWidth="1.5" />
            </svg>
          </div>
        );
      case "custody":
        return (
          <div className="w-12 h-12 flex items-center justify-center">
            <svg width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4L6 8V16C6 22.5 10.5 28 16 30C21.5 28 26 22.5 26 16V8L16 4Z" fill="#3b82f6" fillOpacity="0.8" />
              <path d="M16 8V26" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M10 16H22" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
            </svg>
          </div>
        );
      case "numbered":
        return (
          <div className="w-12 h-12 flex items-center justify-center">
            <svg width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="13" width="16" height="13" rx="2" fill="#f59e0b" />
              <path d="M11 13V10C11 7.23858 13.2386 5 16 5C18.7614 5 21 7.23858 21 10V13" stroke="#94a3b8" strokeWidth="2.5" />
              <circle cx="16" cy="19.5" r="1.5" fill="white" />
              <path d="M16 21V23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "cryptocurrency":
        return (
          <div className="w-12 h-12 flex items-center justify-center">
             <svg width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
              <path d="M12.5 10V22M12.5 10H17.5C19.5 10 21 11.5 21 13C21 14.5 19.5 16 17.5 16M12.5 16H17.5C19.5 16 21 17.5 21 19C21 20.5 19.5 22 17.5 22H12.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 8V10M18 8V10M15 22V24M18 22V24" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onSelect(account.id)}
      className={cn(
        "relative flex flex-col p-6 rounded-lg border transition-all cursor-pointer bg-white h-full min-h-[160px] group",
        isSelected 
          ? "border-[#0a192f] bg-[#f0f7ff] shadow-sm ring-1 ring-[#0a192f]/10" 
          : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-start gap-5">
        <div className={cn(
          "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-2 transition-colors",
          isSelected ? "border-[#0a192f] bg-white" : "border-slate-300"
        )}>
          {isSelected && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#0a192f]" />
          )}
        </div>

        <div className="space-y-2.5 w-full">
          <div className="mb-2">
            {renderIcon()}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-[15px] font-bold text-[#0a192f] font-headline leading-tight">
              {account.title}
            </h3>
            <p className="text-slate-400 text-[12px] font-normal leading-normal">
              {account.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1.5">
            {account.tags.map((tag) => (
              <span 
                key={tag} 
                className="bg-[#c29d45]/15 text-[#856404] text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tight"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
