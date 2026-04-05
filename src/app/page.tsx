"use client";

import { useMeta } from "@/context/meta-context";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Activity, CreditCard, Users, DollarSign, AlertCircle } from "lucide-react"
import Link from 'next/link'
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { adAccounts, adAccountId, setAdAccountId, refreshAdAccounts, isLoading, accessToken } = useMeta();
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // If we have a token but no accounts loaded, try loading
  useEffect(() => {
    if (accessToken && adAccounts.length === 0) {
      refreshAdAccounts();
    }
  }, [accessToken, adAccounts.length, refreshAdAccounts]);

  const selectedAccount = adAccounts.find(a => a.id === adAccountId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          {accessToken && (
            <Select value={adAccountId} onValueChange={setAdAccountId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Ad Account" />
              </SelectTrigger>
              <SelectContent>
                {adAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.account_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Link href="/campaigns/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {!accessToken ? (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">API Not Connected</h3>
              <p className="text-amber-700">Please go to <Link href="/settings" className="underline font-medium">Settings</Link> and enter your Access Token to view real data.</p>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="text-center py-10">Loading account data...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">Currency: {selectedAccount?.currency || 'USD'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'ACTIVE').length}</div>
                <p className="text-xs text-muted-foreground">Active now</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Not available yet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedAccount?.account_status === 1 ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">Account Health</p>
              </CardContent>
            </Card>
          </div>

          {(adAccounts.length === 0 && !isLoading) && (
            <div className="p-8 text-center border border-dashed rounded-lg">
              <p className="text-muted-foreground">No ad accounts found. Please check your token permissions.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
