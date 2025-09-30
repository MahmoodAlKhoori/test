"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Shield } from "lucide-react"

export function RoleToggle() {
  const { currentRole, setCurrentRole } = useAppStore()

  const toggleRole = () => {
    setCurrentRole(currentRole === "User" ? "Manager" : "User")
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Role:</span>
        <Badge
          variant="outline"
          className={`${
            currentRole === "Manager"
              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
          } border font-medium`}
        >
          {currentRole === "Manager" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
          {currentRole}
        </Badge>
      </div>
      <Button variant="outline" size="sm" onClick={toggleRole} className="border-border hover:bg-muted bg-transparent">
        Switch to {currentRole === "User" ? "Manager" : "User"}
      </Button>
    </div>
  )
}
