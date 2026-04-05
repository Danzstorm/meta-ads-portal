"use client";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tipo de presupuesto</Label>
                    <Select
                        value={values.budgetType}
                        onValueChange={(val) => handleChange('budgetType', val)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAILY">Diario — se gasta cada día</SelectItem>
                            <SelectItem value="LIFETIME">Total — se reparte en el período</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {values.budgetType === 'DAILY'
                            ? 'Meta gastará este monto cada día de forma automática.'
                            : 'Meta distribuirá el total durante toda la campaña.'}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Monto (USD)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                        <Input
                            type="number"
                            min={1}
                            className="pl-7"
                            value={values.budgetAmount}
                            onChange={(e) => handleChange('budgetAmount', Number(e.target.value))}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Mínimo recomendado: $5/día. Puedes pausar la campaña en cualquier momento.
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Fecha de inicio <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <Input
                    type="datetime-local"
                    value={values.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                    Si no seleccionas una fecha, la campaña inicia en la próxima hora.
                </p>
            </div>
        </div>
    )
}
