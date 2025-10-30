"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"

type CommissionSlab = {
  from: number
  to: number | null // null represents "Unlimited"
  commission: number
}

type PartnerFormData = {
  email: string
  full_name: string
  commission_slabs: {
    slabs: CommissionSlab[]
  }
}

const DEFAULT_SLABS: CommissionSlab[] = [
  { from: 0, to: 2000, commission: 0 },
  { from: 2001, to: 5000, commission: 30 },
  { from: 5001, to: null, commission: 40 }
]

export default function CreatePartnerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<PartnerFormData>({
    email: "",
    full_name: "",
    commission_slabs: {
      slabs: DEFAULT_SLABS,
    },
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)

  const handleSlabChange = (index: number, field: keyof CommissionSlab, value: string) => {
    const newSlabs = [...formData.commission_slabs.slabs]
    
    if (field === 'to') {
      const numValue = parseInt(value) || 0
      if (numValue > newSlabs[index].from) {
        newSlabs[index].to = numValue
        
        // Auto-update all subsequent slabs to maintain contiguity
        for (let i = index + 1; i < newSlabs.length; i++) {
          if (i === newSlabs.length - 1) {
            // Last slab starts after previous and goes to unlimited
            newSlabs[i].from = (newSlabs[i - 1].to || 0) + 1
            newSlabs[i].to = null
          } else {
            // Middle slabs: update from value only
            newSlabs[i].from = (newSlabs[i - 1].to || 0) + 1
          }
        }
      }
    } else if (field === 'commission') {
      const numValue = parseFloat(value) || 0
      if (numValue >= 0 && numValue <= 100) {
        newSlabs[index].commission = numValue
      }
    }

    setFormData({
      ...formData,
      commission_slabs: { slabs: newSlabs }
    })
  }

  const addSlab = () => {
    const slabs = formData.commission_slabs.slabs
    const lastSlab = slabs[slabs.length - 1]
    
    // If last slab is unlimited (to: null), we need to give it a finite value first
    if (lastSlab.to === null) {
      // Set a default upper limit for the current last slab
      const defaultTo = lastSlab.from + 1000 // Add 1000 as default range
      const updatedSlabs = [...slabs]
      updatedSlabs[slabs.length - 1].to = defaultTo
      
      // Add new unlimited slab
      const newSlab: CommissionSlab = {
        from: defaultTo + 1,
        to: null,
        commission: lastSlab.commission,
      }
      
      updatedSlabs.push(newSlab)
      
      setFormData({
        ...formData,
        commission_slabs: { slabs: updatedSlabs }
      })
    } else {
      // Last slab already has a finite value, just add new unlimited slab
      const newSlab: CommissionSlab = {
        from: lastSlab.to + 1,
        to: null,
        commission: lastSlab.commission,
      }

      setFormData({
        ...formData,
        commission_slabs: { slabs: [...slabs, newSlab] }
      })
    }
    
    setMessage(null)
    setMessageType(null)
  }

  const removeSlab = (index: number) => {
    const slabs = formData.commission_slabs.slabs
    
    // Cannot remove first slab
    if (index === 0) {
      setMessage("Cannot remove the first slab")
      setMessageType('error')
      return
    }

    const newSlabs = slabs.filter((_, i) => i !== index)
    
    // If we removed the last slab, make the new last slab unlimited
    if (index === slabs.length - 1 && newSlabs.length > 0) {
      newSlabs[newSlabs.length - 1].to = null
    }

    setFormData({
      ...formData,
      commission_slabs: { slabs: newSlabs }
    })
    setMessage(null)
    setMessageType(null)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic client-side checks
    if (!formData.email || !formData.full_name) {
      setMessage("Please fill in all required fields")
      setMessageType('error')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Please enter a valid email address")
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage(null)
    setMessageType(null)

    try {
      const res = await fetch("/api/create-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const err = await res.json()
        console.log("API Error Response:", err)
        const errorMessage = err.error || "Failed to create partner"
        console.log("Setting error message:", errorMessage)
        setMessage(errorMessage)
        setMessageType('error')
        return
      }

      const data = await res.json()
      setMessage(data.message || `Partner ${formData.full_name} created with ${formData.email}`)
      setMessageType('success')

      // Reset form
      setFormData({
        email: "",
        full_name: "",
        commission_slabs: {
          slabs: DEFAULT_SLABS,
        },
      })
    } catch (err) {
      setMessage("Unable to create partner. Please try again.")
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Partner</h1>
        <p className="text-muted-foreground">Add a new partner to the system</p>
      </div>

      {message && messageType && (
        <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Partner Details</CardTitle>
          <CardDescription>Enter the information for the new partner</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="partner@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4">
              <Label className="text-base font-medium">Commission Slabs</Label>
              
              <div className="bg-white border rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 mb-3 text-sm font-medium text-gray-600">
                  <div>From</div>
                  <div>To</div>
                  <div>Commission %</div>
                </div>
                
                <div className="space-y-3">
                  {formData.commission_slabs.slabs.map((slab, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                      <Input
                        type="text"
                        value={slab.from.toLocaleString()}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                      
                      <Input
                        type="text"
                        value={index === formData.commission_slabs.slabs.length - 1 ? "—" : slab.to?.toLocaleString() || ""}
                        onChange={(e) => {
                          if (index < formData.commission_slabs.slabs.length - 1) {
                            const value = e.target.value.replace(/,/g, '')
                            if (!isNaN(Number(value)) && Number(value) > slab.from) {
                              handleSlabChange(index, 'to', value)
                            }
                          }
                        }}
                        disabled={index === formData.commission_slabs.slabs.length - 1}
                        className={index === formData.commission_slabs.slabs.length - 1 ? "bg-gray-50 text-gray-700 text-center" : ""}
                        placeholder={index === formData.commission_slabs.slabs.length - 1 ? "" : "Enter amount"}
                      />
                      
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={slab.commission}
                          onChange={(e) => handleSlabChange(index, 'commission', e.target.value)}
                          className="w-20"
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSlab(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSlab}
                    className="px-6"
                  >
                    Add Slab
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Partner..." : "Create Partner"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dialog removed - admin auth via headers */}
    </div>
  )
}