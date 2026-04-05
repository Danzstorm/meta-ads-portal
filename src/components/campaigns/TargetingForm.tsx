"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { dictionaries, Language } from "@/lib/dictionaries"
import { countries } from "@/lib/countries"

export interface TargetingParams {
    age_min: number;
    age_max: number;
    genders: number[]; // 1=Male, 2=Female, 0=All (Meta API specific)
    geo_locations: {
        countries: string[];
    };
    languages: string[];
    detailed_targeting: string[]; // Just strings for visualization
    placements: 'advantage' | 'manual';
}

interface TargetingFormProps {
    values: TargetingParams;
    onChange: (values: TargetingParams) => void;
    lang: Language;
}

export function TargetingForm({ values, onChange, lang }: TargetingFormProps) {
    const t = dictionaries[lang];

    const handleChange = (field: string, value: any) => {
        onChange({ ...values, [field]: value });
    };

    const handleGenderChange = (val: string) => {
        let genders: number[] = [];
        if (val === '1') genders = [1];
        if (val === '2') genders = [2];
        // Empty for ALL
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

    const removeLanguage = (langToRemove: string) => {
        handleChange('languages', values.languages.filter(l => l !== langToRemove));
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

    const removeInterest = (interestToRemove: string) => {
        handleChange('detailed_targeting', values.detailed_targeting.filter(i => i !== interestToRemove));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.adSet.audience}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Location, Age, Gender */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>{t.adSet.location} (Country Code)</Label>
                        <Label>{t.adSet.location}</Label>
                        <Select
                            value={values.geo_locations.countries[0] || ''}
                            onValueChange={(val) => handleChange('geo_locations', { countries: [val] })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Country" />
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
                        <Label>{t.adSet.ageMin}</Label>
                        <Input
                            type="number"
                            min={13} max={65}
                            value={values.age_min}
                            onChange={(e) => handleChange('age_min', parseInt(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t.adSet.ageMax}</Label>
                        <Input
                            type="number"
                            min={13} max={65}
                            value={values.age_max}
                            onChange={(e) => handleChange('age_max', parseInt(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t.adSet.gender}</Label>
                        <Select onValueChange={handleGenderChange} defaultValue={values.genders.length === 0 ? "0" : values.genders[0].toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder={t.adSet.all} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">{t.adSet.all}</SelectItem>
                                <SelectItem value="1">{t.adSet.male}</SelectItem>
                                <SelectItem value="2">{t.adSet.female}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                    <Label>{t.adSet.languages}</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {values.languages.map((l) => (
                            <Badge key={l} variant="secondary" className="gap-1">
                                {l}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => removeLanguage(l)} />
                            </Badge>
                        ))}
                    </div>
                    <Input
                        placeholder="Type language and press Enter (e.g., English, Spanish)"
                        onKeyDown={addLanguage}
                    />
                </div>

                {/* Detailed Targeting */}
                <div className="space-y-2">
                    <Label>{t.adSet.detailedTargeting}</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {values.detailed_targeting.map((i) => (
                            <Badge key={i} variant="outline" className="gap-1">
                                {i}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => removeInterest(i)} />
                            </Badge>
                        ))}
                    </div>
                    <Input
                        placeholder="Add interests, behaviors... (Type and press Enter)"
                        onKeyDown={addInterest}
                    />
                </div>

                {/* Placements */}
                <div className="space-y-3 pt-2">
                    <Label className="text-base">{t.adSet.placements}</Label>
                    <RadioGroup
                        value={values.placements}
                        onValueChange={(val: 'advantage' | 'manual') => handleChange('placements', val)}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="advantage" id="p-advantage" />
                            <Label htmlFor="p-advantage">{t.adSet.advantagePlacements}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="p-manual" />
                            <Label htmlFor="p-manual">{t.adSet.manualPlacements}</Label>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
    )
}
