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
            <h2 className="font-semibold">Subscription Access</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              MVP uses a subscription token. Set `SUBSCRIPTION_ACCESS_TOKEN` on the server, then enter the same token here.
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
