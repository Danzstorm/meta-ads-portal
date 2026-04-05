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

export default function SettingsPage() {
    const { accessToken: contextToken, setAccessToken, adAccounts, adAccountId, setAdAccountId } = useMeta();
    const [token, setToken] = useState("");

    useEffect(() => {
        if (contextToken) setToken(contextToken);
    }, [contextToken]);

    const handleSave = () => {
        if (!token) {
            toast.error("Please enter an access token");
            return;
        }
        setAccessToken(token);
        toast.success("Configuration saved successfully!");
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>
            <Card className="w-[600px]">
                <CardHeader>
                    <CardTitle>Meta API Configuration</CardTitle>
                    <CardDescription>
                        Connect with Facebook to automatically configure your access token and permissions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <MetaLoginButton onLogin={(token) => {
                        setAccessToken(token);
                        setToken(token);
                    }} />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">O ingresa el token manualmente</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="accessToken">Access Token</Label>
                        <Input
                            id="accessToken"
                            type="password"
                            placeholder="EAAB..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                    <Button onClick={handleSave}>Save Manual Configuration</Button>

                    {adAccounts.length > 0 && (
                        <div className="w-full space-y-2 pt-4 border-t">
                            <Label>Active Ad Account</Label>
                            <Select value={adAccountId} onValueChange={setAdAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Ad Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {adAccounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name} ({account.account_id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Selected: {adAccountId}
                            </p>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
