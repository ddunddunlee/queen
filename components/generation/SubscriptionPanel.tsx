"use client";

import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface SubscriptionPanelProps {
  token: string;
  onTokenChange: (token: string) => void;
}

export function SubscriptionPanel({ onTokenChange, token }: SubscriptionPanelProps) {
  return (
    <div className="rounded-lg border border-line bg-panelSoft/70 p-4">
      <div className="flex items-start gap-3">
        <KeyRound aria-hidden className="mt-1 h-5 w-5 text-sky" />
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="font-semibold">구독 접근 토큰</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              자동 생성은 서버에 설정된 구독 토큰과 일치할 때만 실행됩니다.
            </p>
          </div>
          <Input
            autoComplete="off"
            placeholder="dev-subscriber"
            type="password"
            value={token}
            onChange={(event) => onTokenChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
