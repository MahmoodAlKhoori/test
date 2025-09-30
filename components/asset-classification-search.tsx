"use client"

import { useState } from "react"
import { Search, Check, FileText } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Mock asset classification data
const ASSET_CLASSIFICATIONS = [
  {
    id: "ACF-2024-001",
    name: "Customer Data Management System",
    confidentiality: 5,
    integrity: 5,
    availability: 4,
    businessUnit: "Customer Operations",
  },
  {
    id: "ACF-2024-002",
    name: "Internal HR Portal",
    confidentiality: 4,
    integrity: 3,
    availability: 3,
    businessUnit: "Human Resources",
  },
  {
    id: "ACF-2024-003",
    name: "Financial Reporting System",
    confidentiality: 5,
    integrity: 5,
    availability: 5,
    businessUnit: "Finance",
  },
  {
    id: "ACF-2024-004",
    name: "Marketing Website",
    confidentiality: 2,
    integrity: 3,
    availability: 3,
    businessUnit: "Marketing",
  },
  {
    id: "ACF-2024-005",
    name: "Payment Processing Gateway",
    confidentiality: 5,
    integrity: 5,
    availability: 5,
    businessUnit: "Finance",
  },
  {
    id: "ACF-2024-006",
    name: "Employee Training Platform",
    confidentiality: 2,
    integrity: 2,
    availability: 2,
    businessUnit: "Human Resources",
  },
  {
    id: "ACF-2024-007",
    name: "Core Banking System",
    confidentiality: 5,
    integrity: 5,
    availability: 5,
    businessUnit: "IT",
  },
  {
    id: "ACF-2024-008",
    name: "Document Management System",
    confidentiality: 4,
    integrity: 4,
    availability: 3,
    businessUnit: "Operations",
  },
]

interface AssetClassificationSearchProps {
  onSelect: (classification: {
    id: string
    name: string
    confidentiality: number
    integrity: number
    availability: number
  }) => void
  disabled?: boolean
  selectedId?: string
}

export function AssetClassificationSearch({ onSelect, disabled, selectedId }: AssetClassificationSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedClassification = ASSET_CLASSIFICATIONS.find((c) => c.id === selectedId)

  const filteredClassifications = ASSET_CLASSIFICATIONS.filter(
    (classification) =>
      classification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classification.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classification.businessUnit.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-2">
      <Label className="text-foreground flex items-center">
        <FileText className="w-4 h-4 mr-2" />
        Asset Classification Form (Optional)
      </Label>
      <p className="text-xs text-muted-foreground mb-2">
        Search and select an asset classification to auto-populate CIA requirements
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between bg-background border-border text-foreground hover:bg-muted"
          >
            {selectedClassification ? (
              <span className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {selectedClassification.id}
                </Badge>
                {selectedClassification.name}
              </span>
            ) : (
              <span className="text-muted-foreground">Search asset classifications...</span>
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0 bg-popover border-border" align="start">
          <Command className="bg-popover">
            <CommandInput
              placeholder="Search by name, ID, or business unit..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-0 bg-popover text-foreground"
            />
            <CommandList>
              <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
                No asset classifications found.
              </CommandEmpty>
              <CommandGroup>
                {filteredClassifications.map((classification) => (
                  <CommandItem
                    key={classification.id}
                    value={classification.id}
                    onSelect={() => {
                      onSelect({
                        id: classification.id,
                        name: classification.name,
                        confidentiality: classification.confidentiality,
                        integrity: classification.integrity,
                        availability: classification.availability,
                      })
                      setOpen(false)
                    }}
                    className="flex items-center justify-between cursor-pointer hover:bg-muted"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className="mr-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
                        >
                          {classification.id}
                        </Badge>
                        <span className="font-medium text-foreground">{classification.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">{classification.businessUnit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-muted-foreground">
                        C:{classification.confidentiality} I:{classification.integrity} A:{classification.availability}
                      </div>
                      {selectedId === classification.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedClassification && (
        <div className="mt-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/30">
          <p className="text-xs text-blue-400 flex items-center">
            <Check className="w-3 h-3 mr-1" />
            CIA requirements will be auto-populated from this asset classification
          </p>
        </div>
      )}
    </div>
  )
}
