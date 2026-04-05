"use client";

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Users, MousePointerClick, MessageCircle, Smartphone } from "lucide-react"

export type ObjectiveType = 'OUTCOME_SALES' | 'OUTCOME_LEADS' | 'OUTCOME_TRAFFIC' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_AWARENESS' | 'OUTCOME_APP_PROMOTION';

interface ObjectiveSelectProps {
    selected: ObjectiveType | null;
    onSelect: (objective: ObjectiveType) => void;
}

export function ObjectiveSelect({ selected, onSelect }: ObjectiveSelectProps) {
    const objectives = [
        {
            id: "OUTCOME_SALES",
            label: "Sales",
            description: "Find people who are likely to purchase your product or service.",
            icon: TrendingUp,
        },
        {
            id: "OUTCOME_LEADS",
            label: "Leads",
            description: "Collect leads for your business or brand.",
            icon: Target,
        },
        {
            id: "OUTCOME_TRAFFIC",
            label: "Traffic",
            description: "Send people to a destination, like your website, app or Facebook event.",
            icon: MousePointerClick,
        },
        {
            id: "OUTCOME_ENGAGEMENT",
            label: "Engagement",
            description: "Get more messages, video views, post engagement, page likes or event responses.",
            icon: MessageCircle,
        },
        {
            id: "OUTCOME_AWARENESS",
            label: "Awareness",
            description: "Show your ads to people who are most likely to remember them.",
            icon: Users,
        },
        {
            id: "OUTCOME_APP_PROMOTION",
            label: "App Promotion",
            description: "Find new people to install your app and continue using it.",
            icon: Smartphone,
        },
    ] as const;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectives.map((obj) => (
                <Card
                    key={obj.id}
                    className={`cursor-pointer transition-all hover:border-primary p-4 space-y-3 ${selected === obj.id ? "border-2 border-primary bg-primary/5" : "border-border"
                        }`}
                    onClick={() => onSelect(obj.id)}
                >
                    <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${selected === obj.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            <obj.icon className="h-6 w-6" />
                        </div>
                        {selected === obj.id && <Badge variant="secondary">Selected</Badge>}
                    </div>
                    <div>
                        <h3 className="font-semibold">{obj.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{obj.description}</p>
                    </div>
                </Card>
            ))}
        </div>
    )
}
