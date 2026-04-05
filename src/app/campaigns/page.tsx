"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useMeta } from "@/context/meta-context"
import { PlusCircle, Loader2, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MetaCampaign } from "@/lib/meta-api"
import { toast } from "sonner"

export default function CampaignsPage() {
    const { apiClient, adAccountId, accessToken } = useMeta();
    const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCampaigns = async () => {
            if (!apiClient || !adAccountId) return;

            setIsLoading(true);
            try {
                const response = await apiClient.getCampaigns(adAccountId);
                console.log("Fetched Campaigns:", response.data);
                setCampaigns(response.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load campaigns");
            } finally {
                setIsLoading(false);
            }
        };

        if (accessToken) {
            fetchCampaigns();
        }
    }, [apiClient, adAccountId, accessToken]);

    if (!accessToken) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
                </div>
                <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">API Not Connected</h3>
                    <p className="text-muted-foreground mb-4">Please configure your Access Token in Settings to view campaigns.</p>
                    <Link href="/settings">
                        <Button variant="outline">Go to Settings</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => {
                        setIsLoading(true);
                        // Force re-fetch
                        if (accessToken && apiClient && adAccountId) {
                            apiClient.getCampaigns(adAccountId).then(response => {
                                console.log("Manual Refresh Campaigns:", response.data);
                                setCampaigns(response.data);
                                toast.success("Refreshed");
                            }).catch(e => toast.error("Failed to refresh")).finally(() => setIsLoading(false));
                        }
                    }}>
                        <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Link href="/campaigns/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Campaign
                        </Button>
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[400px]">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            No campaigns found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            You haven't created any campaigns yet in this ad account.
                        </p>
                        <Link href="/campaigns/create">
                            <Button className="mt-4">Create Campaign</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {campaigns.map((campaign) => (
                        <Card key={campaign.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex flex-col gap-1">
                                    <CardTitle className="text-base font-medium">
                                        {campaign.name}
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${campaign.status === 'ACTIVE' ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {campaign.effective_status || campaign.status}
                                    </span>
                                    <Switch
                                        checked={campaign.status === 'ACTIVE'}
                                        onCheckedChange={async (checked) => {
                                            const newStatus = checked ? 'ACTIVE' : 'PAUSED';
                                            // Optimistic update
                                            setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
                                            try {
                                                if (!apiClient) throw new Error("API Client not ready");
                                                await apiClient.updateCampaignStatus(campaign.id, newStatus);
                                                toast.success(`Campaign ${checked ? 'activated' : 'paused'}`);
                                            } catch (error) {
                                                console.error(error);
                                                toast.error("Failed to update status");
                                                // Revert
                                                setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status: campaign.status } : c));
                                            }
                                        }}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    Objective: {campaign.objective}
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-xs text-muted-foreground">
                                        ID: {campaign.id}
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={async () => {
                                            if (confirm("Are you sure you want to delete this campaign? This cannot be undone.")) {
                                                try {
                                                    if (!apiClient) throw new Error("API Client not ready");
                                                    await apiClient.deleteCampaign(campaign.id);
                                                    setCampaigns(campaigns.filter(c => c.id !== campaign.id));
                                                    toast.success("Campaign deleted");
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error("Failed to delete campaign");
                                                }
                                            }
                                        }}
                                    >
                                        <Trash2 className="mr-1 h-3 w-3" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
            }
        </div >
    )
}
