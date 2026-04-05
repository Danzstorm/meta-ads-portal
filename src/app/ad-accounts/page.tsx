"use client";

import { useMeta } from "@/context/meta-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdAccountsPage() {
    const { adAccounts, adAccountId, setAdAccountId, isLoading, accessToken, refreshAdAccounts } = useMeta();

    if (!accessToken) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Ad Accounts</h1>
                <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">API Not Connected</h3>
                    <p className="text-muted-foreground mb-4">Please configure your Access Token in Settings to load Ad Accounts.</p>
                    <Link href="/settings">
                        <Button variant="outline">Go to Settings</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Ad Accounts</h1>
                    <p className="text-muted-foreground">Select the Ad Account you want to manage.</p>
                </div>
                <Button variant="outline" onClick={refreshAdAccounts} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Refresh Lists
                </Button>
            </div>

            {isLoading && adAccounts.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : adAccounts.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No Ad Accounts found for this token.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {adAccounts.map((account) => (
                        <Card
                            key={account.id}
                            className={`cursor-pointer transition-all hover:border-primary ${adAccountId === account.id ? 'border-primary ring-1 ring-primary' : ''}`}
                            onClick={() => setAdAccountId(account.id)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base font-semibold">{account.name}</CardTitle>
                                    {adAccountId === account.id && <Check className="h-5 w-5 text-primary" />}
                                </div>
                                <CardDescription>ID: {account.account_id}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Currency: {account.currency}</span>
                                </div>
                                <div className="mt-2 text-xs">
                                    Status: <span className={account.account_status === 1 ? "text-green-600 font-medium" : "text-amber-600"}>
                                        {account.account_status === 1 ? 'Active' : 'Inactive/Review'}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={adAccountId === account.id ? "default" : "outline"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAdAccountId(account.id);
                                    }}
                                >
                                    {adAccountId === account.id ? "Selected" : "Select Account"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
