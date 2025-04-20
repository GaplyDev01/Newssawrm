"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Lock, UserIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AccountSettingsProps {
  user: User | null
  profile: any
}

export function AccountSettings({ user, profile }: AccountSettingsProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [loading, setLoading] = useState(false)

  const handleSaveProfile = async () => {
    if (!user) return

    setLoading(true)

    try {
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Account Settings</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">CryptoIntel User</h3>
              <p className="text-muted-foreground">Crypto Enthusiast</p>
              <p className="text-sm text-muted-foreground">Member since {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <div className="flex items-center gap-2">
                <Input id="email-address" value={user?.email || ""} disabled />
                <div className="flex items-center text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                  Verified
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-id">Account ID</Label>
              <Input id="account-id" value={user?.id.substring(0, 8) + "..."} disabled />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFullName(profile?.full_name || "")
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intelligence Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Market Focus</Label>
              <div className="p-2 border rounded-md">General Markets</div>
            </div>

            <div className="space-y-2">
              <Label>Organization Scale</Label>
              <div className="p-2 border rounded-md">Not specified</div>
            </div>

            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="p-2 border rounded-md min-h-[100px]">
                <p className="text-muted-foreground">No interests specified</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Password</CardTitle>
          <Button variant="outline" size="sm">
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Change your password to keep your account secure.</p>
        </CardContent>
      </Card>
    </div>
  )
}
