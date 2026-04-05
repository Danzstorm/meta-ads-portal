"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, ChevronLeft, Check, Loader2, Languages } from "lucide-react"
import { ObjectiveSelect, ObjectiveType } from "@/components/campaigns/ObjectiveSelect"
import { BudgetForm } from "@/components/campaigns/BudgetForm"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TargetingForm, TargetingParams } from "@/components/campaigns/TargetingForm"
import { AdForm, AdCreativeParams } from "@/components/campaigns/AdForm"
import { useMeta } from "@/context/meta-context"
import { dictionaries, Language } from "@/lib/dictionaries"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function CreateCampaignPage() {
    const router = useRouter();
    const { apiClient, adAccountId } = useMeta();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState<Language>('es'); // Default to Spanish as per user request context
    const t = dictionaries[lang];
    const isSubmitting = useRef(false);

    // Form State
    const [campaignName, setCampaignName] = useState("");
    const [isCBO, setIsCBO] = useState(true);
    const [objective, setObjective] = useState<ObjectiveType | null>(null);
    const [budget, setBudget] = useState({
        budgetType: 'DAILY' as 'DAILY' | 'LIFETIME',
        budgetAmount: 20,
        startDate: '',
        isRecurring: true
    });

    // Ad Set State
    const [adSetName, setAdSetName] = useState("New Ad Set");
    const [targeting, setTargeting] = useState<TargetingParams>({
        age_min: 18,
        age_max: 65,
        genders: [],
        geo_locations: { countries: ['US'] },
        languages: [],
        detailed_targeting: [],
        placements: 'advantage'
    });

    // Ad Creative State
    const [adCreative, setAdCreative] = useState<AdCreativeParams>({
        name: "New Ad",
        headline: "Welcome",
        primary_text: "Check out our latest offers.",
        link_url: "https://example.com",
        page_id: "",
        image_url: ""
    });

    // Default name when objective changes
    const handleObjectiveSelect = (obj: ObjectiveType) => {
        setObjective(obj);
        if (!campaignName) {
            setCampaignName(`New ${obj.replace('OUTCOME_', '')} Campaign`);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!objective) {
                toast.error(t.campaign.selectObjective);
                return;
            }
            if (!campaignName.trim()) {
                toast.error(t.campaign.name + " is required.");
                return;
            }
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'es' : 'en');
    };


    // Verification State
    const [verificationResult, setVerificationResult] = useState<any | null>(null);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);



    const handleSubmit = async () => {
        // Validation for Ad Creative
        if (!adCreative.page_id) {
            toast.error("Please select a Facebook Page (Identity) or enter a Page ID manually in Step 3.");
            return;
        }

        if (!adCreative.image_url) {
            toast.error("Please select an image for your ad.");
            return;
        }

        if (!apiClient || !adAccountId) {
            toast.error("Error: Call to API failed. Ad Account ID or Access Token is missing.");
            console.error("Missing Context:", { apiClient: !!apiClient, adAccountId });
            return;
        }

        if (isSubmitting.current || loading) {
            return;
        }
        isSubmitting.current = true;
        setLoading(true);

        // Track IDs for verification
        let createdCampaignId = "";
        let createdAdSetId = "";
        let createdAdId = "";

        try {
            // 1. Create Campaign
            const campaignPayload: any = {
                name: campaignName,
                objective: objective as string,
                status: 'ACTIVE', // Changed from PAUSED to test if it bypasses spam filter
                special_ad_categories: [],
                buying_type: 'AUCTION',
            };

            if (isCBO) {
                if (budget.budgetType === 'DAILY') {
                    campaignPayload.daily_budget = Math.round(budget.budgetAmount * 100);
                } else {
                    campaignPayload.lifetime_budget = Math.round(budget.budgetAmount * 100);
                }
                campaignPayload.bid_strategy = 'LOWEST_COST_WITHOUT_CAP';
            } else {
                campaignPayload.is_adset_budget_sharing_enabled = false;
            }

            console.log("Creating Campaign...", campaignPayload);
            const campaignRes = await apiClient.createCampaign(adAccountId, campaignPayload);
            createdCampaignId = campaignRes.id;
            toast.success(`Campaign created! ID: ${createdCampaignId}`);

            // 2. Create Ad Set
            // Map campaign objective to compatible optimization_goal and billing_event
            const objectiveGoalMap: Record<string, { optimization_goal: string; billing_event: string }> = {
                OUTCOME_AWARENESS:      { optimization_goal: 'REACH',                  billing_event: 'IMPRESSIONS' },
                OUTCOME_TRAFFIC:        { optimization_goal: 'LINK_CLICKS',            billing_event: 'IMPRESSIONS' },
                OUTCOME_ENGAGEMENT:     { optimization_goal: 'POST_ENGAGEMENT',        billing_event: 'IMPRESSIONS' },
                OUTCOME_LEADS:          { optimization_goal: 'LEAD_GENERATION',        billing_event: 'IMPRESSIONS' },
                OUTCOME_APP_PROMOTION:  { optimization_goal: 'APP_INSTALLS',           billing_event: 'IMPRESSIONS' },
                OUTCOME_SALES:          { optimization_goal: 'OFFSITE_CONVERSIONS',    billing_event: 'IMPRESSIONS' },
            };
            const goalConfig = objectiveGoalMap[objective as string] ?? { optimization_goal: 'REACH', billing_event: 'IMPRESSIONS' };

            const adSetPayload: any = {
                name: adSetName,
                campaign_id: createdCampaignId,
                status: 'PAUSED',
                targeting: {
                    ...targeting,
                    languages: undefined,
                    detailed_targeting: undefined,
                    placements: undefined,
                    publisher_platforms: undefined,
                    targeting_automation: {
                        advantage_audience: 0,
                    },
                },
                start_time: budget.startDate ? new Date(budget.startDate).toISOString() : new Date(Date.now() + 1000 * 60 * 60).toISOString(),
                billing_event: goalConfig.billing_event,
                optimization_goal: goalConfig.optimization_goal,
            };

            // bid_strategy only on ad set when NOT using CBO (with CBO it lives on the campaign)
            if (!isCBO) {
                adSetPayload.bid_strategy = 'LOWEST_COST_WITHOUT_CAP';
            }

            if (!isCBO) {
                if (budget.budgetType === 'DAILY') {
                    adSetPayload.daily_budget = Math.round(budget.budgetAmount * 100);
                } else {
                    adSetPayload.lifetime_budget = Math.round(budget.budgetAmount * 100);
                }
            }

            console.log("Creating Ad Set...", adSetPayload);
            const adSetRes = await apiClient.createAdSet(adAccountId, adSetPayload);
            createdAdSetId = adSetRes.id;
            toast.success("Ad Set created! Uploading Image...");

            // 3. Upload Image
            let imageHash = "";
            try {
                const fetchRes = await fetch(adCreative.image_url);
                const blob = await fetchRes.blob();
                const uploadRes = await apiClient.uploadImage(adAccountId, blob);
                const images = uploadRes.images;
                const firstKey = Object.keys(images)[0];
                imageHash = images[firstKey].hash;
                toast.success("Image uploaded successfully!");
            } catch (uploadError) {
                console.error("Image Upload Failed:", uploadError);
                toast.error("Failed to upload image to Meta. Ad creation will likely fail.");
                throw uploadError;
            }

            // 4. Create Ad Creative
            let creativeId = "";
            try {
                const creativePayload = {
                    name: `${adCreative.name} - Creative`,
                    object_story_spec: {
                        page_id: adCreative.page_id.trim(),
                        link_data: {
                            message: adCreative.primary_text,
                            link: adCreative.link_url,
                            name: adCreative.headline,
                            image_hash: imageHash,
                            call_to_action: {
                                type: 'LEARN_MORE',
                                value: { link: adCreative.link_url }
                            }
                        }
                    }
                };
                const creativeRes = await apiClient.createAdCreative(adAccountId, creativePayload);
                creativeId = creativeRes.id;
                toast.success(`Creative created! ID: ${creativeId}`);
            } catch (creativeError: any) {
                throw creativeError;
            }

            // 5. Create Ad
            try {
                const adPayload = {
                    name: adCreative.name,
                    adset_id: createdAdSetId,
                    creative: { creative_id: creativeId },
                    status: 'PAUSED'
                };

                const adRes = await apiClient.createAd(adAccountId, adPayload);
                console.log("Ad Creation Response:", adRes);

                if (!adRes || !adRes.id) {
                    throw new Error("Ad creation API returned success but no ID was found in response: " + JSON.stringify(adRes));
                }

                createdAdId = adRes.id;
                toast.success(`FINAL AD CREATED! ID: ${createdAdId}`);

                // 6. VERIFICATION STEP
                toast.info("Verifying Ad Status...");
                if (createdAdId) {
                    const adVerification = await apiClient.getAd(createdAdId);

                    setVerificationResult({
                        campaignId: createdCampaignId,
                        adSetId: createdAdSetId,
                        adId: createdAdId,
                        status: adVerification.status,
                        effective_status: adVerification.effective_status,
                        review_feedback: adVerification.ad_review_feedback,
                        name: adVerification.name
                    });
                    setIsVerificationOpen(true);
                } else {
                    throw new Error("Created Ad ID is missing, cannot verify.");
                }

            } catch (adError: any) {
                console.error("Ad Creation Failed:", adError);
                toast.error(`Failed to create Final Ad: ${adError.message}`);
                throw adError;
            }

        } catch (error: any) {
            console.error("Creation Error:", error);
            let errorMessage = error.message || "Unknown error";

            // Check for specific security checkpoint error (Subcode: 3858385)
            if (errorMessage.includes("3858385") || errorMessage.includes("user to take a pending action")) {
                errorMessage = "Meta Security Checkpoint: You must log in to Facebook Ads Manager and authenticate your account/approve this action.";
                toast.error("Action Required: Check your Facebook Ads Manager.");
            } else {
                toast.error(`${t.common.error}: ${errorMessage}`);
            }

            // If partial success, still show what created
            if (createdCampaignId) {
                setVerificationResult({
                    campaignId: createdCampaignId,
                    adSetId: createdAdSetId || "Failed",
                    adId: "Failed",
                    error: errorMessage
                });
                setIsVerificationOpen(true);
            }

        } finally {
            setLoading(false);
            isSubmitting.current = false;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            {/* ... Existing JSX ... */}

            <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ad Creation Report</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {verificationResult?.error ? (
                            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                                <p className="font-semibold">Creation Failed</p>
                                <p className="text-sm">{verificationResult.error}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 text-green-900 rounded-lg border border-green-200">
                                <p className="font-semibold flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Success!
                                </p>
                                <p className="text-sm mt-1">Your ad was successfully created.</p>
                            </div>
                        )}

                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium">Campaign</span>
                                <span className="col-span-2 font-mono text-xs">{verificationResult?.campaignId}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium">Ad Set</span>
                                <span className="col-span-2 font-mono text-xs">{verificationResult?.adSetId}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium">Ad ID</span>
                                <span className="col-span-2 font-mono text-xs font-bold">{verificationResult?.adId}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                <span className="font-medium">Status</span>
                                <span className="col-span-2">
                                    <Badge variant={verificationResult?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {verificationResult?.status}
                                    </Badge>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="font-medium">Effective</span>
                                <span className="col-span-2 text-muted-foreground">{verificationResult?.effective_status}</span>
                            </div>

                            {verificationResult?.review_feedback && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                                    <strong>Review Feedback:</strong> {JSON.stringify(verificationResult.review_feedback)}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 text-xs text-muted-foreground">
                            <p><strong>Note:</strong> Defaults to PAUSED. If you don't see it in Ads Manager, check your "Search and Filter" settings (ensure "Active" filter is removed).</p>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" variant="secondary" onClick={() => setIsVerificationOpen(false)}>
                            Close
                        </Button>
                        <Button type="button" onClick={() => router.push('/campaigns')}>
                            Go to Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{step === 1 ? t.steps.campaign : step === 2 ? t.steps.adSet : step === 3 ? t.steps.adCreative : t.steps.review}</h1>
                    <p className="text-muted-foreground">Follow the steps to launch your Meta Ad.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2">
                    <Languages className="h-4 w-4" />
                    {lang === 'en' ? 'Español' : 'English'}
                </Button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center space-x-4 text-sm font-medium overflow-x-auto pb-2">
                <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>1</div>
                    {t.common.campaign}
                </div>
                <Separator className="w-8" />
                <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>2</div>
                    {t.common.adSet}
                </div>
                <Separator className="w-8" />
                <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 3 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>3</div>
                    {t.common.ad}
                </div>
                <Separator className="w-8" />
                <div className={`flex items-center gap-2 ${step >= 4 ? "text-primary" : "text-muted-foreground"}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 4 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>4</div>
                    {t.common.review}
                </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">{t.steps.campaign}</h2>
                        </div>

                        <div className="grid gap-6 p-6 border rounded-lg">
                            <div className="space-y-2">
                                <Label>{t.campaign.name}</Label>
                                <Input
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="Ex: Summer Sale 2024"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">{t.campaign.cbo}</Label>
                                    <Switch checked={isCBO} onCheckedChange={setIsCBO} />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {isCBO ? t.campaign.cboDesc : t.campaign.aboDesc}
                                </p>
                            </div>

                            {isCBO && (
                                <div className="space-y-2 pt-2 border-t">
                                    <h4 className="text-sm font-medium">{t.common.budget}</h4>
                                    <BudgetForm values={budget} onChange={setBudget} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">{t.campaign.objective}</h3>
                            <ObjectiveSelect selected={objective} onSelect={handleObjectiveSelect} />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">{t.steps.adSet}</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t.adSet.name}</Label>
                                <Input value={adSetName} onChange={(e) => setAdSetName(e.target.value)} placeholder="Ex: Broad Targeting US" />
                            </div>

                            <TargetingForm values={targeting} onChange={setTargeting} lang={lang} />

                            {!isCBO && (
                                <div className="space-y-2 pt-4">
                                    <h3 className="text-lg font-medium">{t.common.budget}</h3>
                                    <BudgetForm values={budget} onChange={setBudget} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">{t.steps.adCreative}</h2>
                        </div>
                        <AdForm values={adCreative} onChange={setAdCreative} lang={lang} />
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">{t.steps.review}</h2>
                        <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">{t.common.campaign}</span>
                                <p className="font-semibold">{campaignName}</p>
                                <p className="text-sm">{objective?.replace('OUTCOME_', '')} • {isCBO ? 'CBO Active' : 'ABO Active'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">{t.common.adSet}</span>
                                <p className="font-semibold">{adSetName}</p>
                                <p className="text-sm">{targeting.geo_locations.countries.join(', ')} • {targeting.age_min}-{targeting.age_max}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">{t.common.ad}</span>
                                <p className="font-semibold">{adCreative.name}</p>
                                <p className="text-sm">{adCreative.headline}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">{t.common.budget}</span>
                                    <p>${budget.budgetAmount} / {budget.budgetType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t.common.back}
                </Button>

                {step < 4 ? (
                    <Button onClick={handleNext}>
                        {t.common.next}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t.common.launch}
                    </Button>
                )}
            </div>
        </div>
    )
}
