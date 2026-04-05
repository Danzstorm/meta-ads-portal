"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface BudgetFormProps {
    values: {
        budgetType: 'DAILY' | 'LIFETIME';
        budgetAmount: number;
        startDate: string;
        isRecurring: boolean;
    };
    onChange: (values: any) => void;
}

export function BudgetForm({ values, onChange }: BudgetFormProps) {
    const handleChange = (field: string, value: any) => {
        onChange({ ...values, [field]: value });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Budget Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Budget Type</Label>
                            <Select
                                value={values.budgetType}
                                onValueChange={(val) => handleChange('budgetType', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAILY">Daily Budget</SelectItem>
                                    <SelectItem value="LIFETIME">Lifetime Budget</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    type="number"
                                    className="pl-7"
                                    value={values.budgetAmount}
                                    onChange={(e) => handleChange('budgetAmount', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="datetime-local"
                                value={values.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Switch
                                id="recurring"
                                checked={values.isRecurring}
                                onCheckedChange={(val) => handleChange('isRecurring', val)}
                            />
                            <Label htmlFor="recurring">Run continuously starting today</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
