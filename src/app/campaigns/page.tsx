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

    if (!accessToken || !adAccountId) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Campañas</h1>
                </div>
                <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                        {!accessToken ? 'Token no configurado' : 'Cuenta publicitaria no seleccionada'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {!accessToken
                            ? 'Ve a Configuración y guarda tu token de acceso de Meta.'
                            : 'Ve a Configuración y selecciona tu cuenta publicitaria en el dropdown.'}
                    </p>
                    <Link href="/settings">
                        <Button variant="outline">Ir a Configuración</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Campañas</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" title="Actualizar" onClick={() => {
                        setIsLoading(true);
                        if (accessToken && apiClient && adAccountId) {
                            apiClient.getCampaigns(adAccountId).then(response => {
                                setCampaigns(response.data);
                                toast.success("Lista actualizada");
                            }).catch(() => toast.error("Error al actualizar")).finally(() => setIsLoading(false));
                        }
                    }}>
                        <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Link href="/campaigns/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva campaña
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
                            No hay campañas
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            No se encontraron campañas en esta cuenta publicitaria.
                        </p>
                        <Link href="/campaigns/create">
                            <Button className="mt-4">Crear campaña</Button>
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
                                    Objetivo: {campaign.objective?.replace('OUTCOME_', '')}
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
                                            if (confirm("¿Seguro que quieres eliminar esta campaña? Esta acción no se puede deshacer.")) {
                                                try {
                                                    if (!apiClient) throw new Error("API Client not ready");
                                                    await apiClient.deleteCampaign(campaign.id);
                                                    setCampaigns(campaigns.filter(c => c.id !== campaign.id));
                                                    toast.success("Campaña eliminada");
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error("Error al eliminar la campaña");
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
