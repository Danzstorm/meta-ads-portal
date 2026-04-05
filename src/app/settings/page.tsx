"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMeta } from "@/context/meta-context"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { MetaLoginButton } from "@/components/auth/MetaLoginButton"
import { Info } from "lucide-react"

export default function SettingsPage() {
    const {
        accessToken: contextToken,
        setAccessToken,
        adAccounts,
        adAccountId,
        setAdAccountId,
        defaultPageId,
        setDefaultPageId,
    } = useMeta();

    const [token, setToken] = useState("");
    const [pageId, setPageId] = useState("");

    useEffect(() => {
        if (contextToken) setToken(contextToken);
    }, [contextToken]);

    useEffect(() => {
        if (defaultPageId) setPageId(defaultPageId);
    }, [defaultPageId]);

    const handleSaveToken = () => {
        if (!token) {
            toast.error("Por favor ingresa un token de acceso");
            return;
        }
        setAccessToken(token);
        toast.success("Token guardado correctamente");
    };

    const handleSavePageId = () => {
        if (!pageId.trim()) {
            toast.error("Ingresa un ID de página válido");
            return;
        }
        setDefaultPageId(pageId.trim());
        toast.success("Página guardada. Se usará por defecto en todos tus anuncios.");
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground text-sm mt-1">Conecta tu cuenta de Meta para empezar a crear campañas.</p>
            </div>

            {/* Token */}
            <Card>
                <CardHeader>
                    <CardTitle>Conexión con Meta</CardTitle>
                    <CardDescription>
                        Usa el botón de Facebook para conectarte automáticamente, o ingresa tu token manualmente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <MetaLoginButton onLogin={(t) => {
                        setAccessToken(t);
                        setToken(t);
                        toast.success("Conectado con Facebook correctamente");
                    }} />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">O ingresa el token manualmente</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Token de acceso</Label>
                        <Input
                            type="password"
                            placeholder="EAAg..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                        <div className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">
                                Obtén tu token en <strong>Meta for Developers → API de Marketing → Herramientas → Obtener token</strong>.
                                Asegúrate de marcar: <code>ads_management</code>, <code>ads_read</code>.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveToken}>Guardar token</Button>
                </CardFooter>
            </Card>

            {/* Ad Account */}
            {adAccounts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Cuenta publicitaria activa</CardTitle>
                        <CardDescription>Selecciona la cuenta donde se crearán tus campañas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={adAccountId} onValueChange={setAdAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una cuenta" />
                            </SelectTrigger>
                            <SelectContent>
                                {adAccounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.name} ({account.account_id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">Cuenta seleccionada: <code>{adAccountId}</code></p>
                    </CardContent>
                </Card>
            )}

            {/* Default Page ID */}
            <Card>
                <CardHeader>
                    <CardTitle>Página de Facebook predeterminada</CardTitle>
                    <CardDescription>
                        Se usará automáticamente en todos tus anuncios. Solo necesitas configurarlo una vez.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label>ID de tu página de Facebook</Label>
                        <Input
                            value={pageId}
                            onChange={(e) => setPageId(e.target.value)}
                            placeholder="Ej: 61580381969642"
                            className="font-mono"
                        />
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                            Encuentra el ID de tu página: abre tu página en Facebook → mira la URL del navegador → el número después de <code>id=</code> es tu Page ID.
                            {defaultPageId && <span className="block mt-1 text-green-600 dark:text-green-400 font-medium">✓ Página guardada: {defaultPageId}</span>}
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSavePageId}>Guardar página</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
