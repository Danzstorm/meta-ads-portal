"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { X, Info } from "lucide-react"
import { countries } from "@/lib/countries"

export interface TargetingParams {
    age_min: number;
    age_max: number;
    genders: number[];
    geo_locations: { countries: string[] };
    languages: string[];
    detailed_targeting: string[];
    placements: 'advantage' | 'manual';
}

interface TargetingFormProps {
    values: TargetingParams;
    onChange: (values: TargetingParams) => void;
    lang: string;
}

export function TargetingForm({ values, onChange }: TargetingFormProps) {
    const handleChange = (field: string, value: any) => {
        onChange({ ...values, [field]: value });
    };

    const handleGenderChange = (val: string) => {
        let genders: number[] = [];
        if (val === '1') genders = [1];
        if (val === '2') genders = [2];
        onChange({ ...values, genders });
    };

    const addLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = e.currentTarget.value.trim();
            if (val && !values.languages.includes(val)) {
                handleChange('languages', [...values.languages, val]);
                e.currentTarget.value = '';
            }
        }
    };

    const addInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = e.currentTarget.value.trim();
            if (val && !values.detailed_targeting.includes(val)) {
                handleChange('detailed_targeting', [...values.detailed_targeting, val]);
                e.currentTarget.value = '';
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Audiencia</CardTitle>
                <p className="text-sm text-muted-foreground">Define a quién quieres llegar con tu anuncio.</p>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Location + Age + Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>País</Label>
                        <Select
                            value={values.geo_locations.countries[0] || ''}
                            onValueChange={(val) => handleChange('geo_locations', { countries: [val] })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un país" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country.value} value={country.value}>
                                        {country.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Edad mínima</Label>
                        <Select
                            value={String(values.age_min)}
                            onValueChange={(val) => handleChange('age_min', parseInt(val))}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {[18,21,25,30,35,40,45,50,55,60,65].map(age => (
                                    <SelectItem key={age} value={String(age)}>{age} años</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Edad máxima</Label>
                        <Select
                            value={String(values.age_max)}
                            onValueChange={(val) => handleChange('age_max', parseInt(val))}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {[25,30,35,40,45,50,55,60,65].map(age => (
                                    <SelectItem key={age} value={String(age)}>{age} años</SelectItem>
                                ))}
                                <SelectItem value="65">65+ años</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Género</Label>
                        <Select
                            value={values.genders.length === 0 ? "0" : values.genders[0].toString()}
                            onValueChange={handleGenderChange}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Todos</SelectItem>
                                <SelectItem value="1">Solo hombres</SelectItem>
                                <SelectItem value="2">Solo mujeres</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                    <Label>
                        Intereses <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {values.detailed_targeting.map((i) => (
                            <Badge key={i} variant="outline" className="gap-1">
                                {i}
                                <X className="h-3 w-3 cursor-pointer" onClick={() =>
                                    handleChange('detailed_targeting', values.detailed_targeting.filter(x => x !== i))
                                } />
                            </Badge>
                        ))}
                    </div>
                    <Input
                        placeholder="Ej: Emprendimiento, Fitness, Tecnología... (escribe y presiona Enter)"
                        onKeyDown={addInterest}
                    />
                    <p className="text-xs text-muted-foreground">
                        Agrega intereses para llegar a personas más afines a tu producto.
                    </p>
                </div>

                {/* Placements */}
                <div className="space-y-3 pt-2 border-t">
                    <Label className="text-base">Ubicaciones del anuncio</Label>
                    <RadioGroup
                        value={values.placements}
                        onValueChange={(val: 'advantage' | 'manual') => handleChange('placements', val)}
                        className="space-y-3"
                    >
                        <div className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30">
                            <RadioGroupItem value="advantage" id="p-advantage" className="mt-0.5" />
                            <div>
                                <Label htmlFor="p-advantage" className="cursor-pointer font-medium">
                                    Automático (recomendado)
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Meta elige las mejores ubicaciones: Feed, Stories, Reels, etc.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30">
                            <RadioGroupItem value="manual" id="p-manual" className="mt-0.5" />
                            <div>
                                <Label htmlFor="p-manual" className="cursor-pointer font-medium">
                                    Manual
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Tú controlas dónde aparece el anuncio (avanzado).
                                </p>
                            </div>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
    )
}
