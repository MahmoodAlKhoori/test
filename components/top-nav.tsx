"use client"

import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopNavProps {
  activeTab?: string
}

export function TopNav({ activeTab = "Suppliers" }: TopNavProps) {
  const tabs = ["Suppliers"]

  return (
    <div className="border-b border-border bg-card">
      {/* Main Navigation */}
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center space-x-6">
          <div className="flex items-center justify-center w-8 h-8 bg-foreground text-background rounded font-bold text-sm">
            V
          </div>
          <span className="text-sm font-semibold text-foreground">Supplier Assurance</span>
          <div className="h-6 w-px bg-border" />
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`text-sm ${
                tab === activeTab
                  ? "text-foreground font-semibold border-b-2 border-foreground pb-[1.1rem] -mb-[1px]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-muted-foreground hover:text-foreground">Delegation</button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
