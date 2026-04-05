"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, X, Image as LucideImage } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { dictionaries, Language } from "@/lib/dictionaries"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Asset } from "@/components/assets/AssetLibrary"
import { useMeta } from "@/context/meta-context"
import { toast } from "sonner"

export interface AdCreativeParams {
    name: string;
    headline: string;
    primary_text: string;
    link_url: string;
    page_id: string; // ID of the Facebook Page
    image_url: string; // Local preview URL
}

interface AdFormProps {
    values: AdCreativeParams;
    onChange: (values: AdCreativeParams) => void;
    lang: Language;
}

export function AdForm({ values, onChange, lang }: AdFormProps) {
    const t = dictionaries[lang];
    const { pages } = useMeta();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isAssetOpen, setIsAssetOpen] = useState(false);

    // Load assets from localStorage when dialog opens
    useEffect(() => {
        if (isAssetOpen) {
            const stored = localStorage.getItem("meta_ads_assets");
            if (stored) {
                setAssets(JSON.parse(stored));
            }
        }
    }, [isAssetOpen]);

    const handleChange = (field: string, value: any) => {
        onChange({ ...values, [field]: value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Convert to Base64 for consistency and potential persistence
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('image_url', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectAsset = (asset: Asset) => {
        if (asset.url.startsWith('blob:')) {
            toast.error("This asset is from an older version and is broken. Please delete and re-upload it.");
            return;
        }

        const newValues = {
            ...values,
            image_url: asset.url,
            headline: asset.name, // Auto-fill headline
            primary_text: asset.context || values.primary_text // Auto-fill context if available, else keep existing
        };

        onChange(newValues);
        setIsAssetOpen(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.steps.adCreative}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Identity & Content */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.ad.name}</Label>
                            <Input
                                value={values.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Ex: Summer Sale Video Ad"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.ad.facebookPage} ({t.ad.identity})</Label>
                            <Select
                                value={values.page_id}
                                onValueChange={(val) => handleChange('page_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Facebook Page" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pages.length > 0 ? pages.map(page => (
                                        <SelectItem key={page.id} value={page.id}>{page.name}</SelectItem>
                                    )) : (
                                        <SelectItem value="mock" disabled>No Pages Found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {pages.length === 0 && (
                                <p className="text-xs text-muted-foreground">Ensure your Access Token has `pages_read_engagement` permission.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">Or Enter Page ID Manually</Label>
                            </div>
                            <Input
                                value={values.page_id}
                                onChange={(e) => handleChange('page_id', e.target.value)}
                                placeholder="e.g. 104683355590924 (Found in Page URL)"
                                className="text-sm font-mono h-8"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Use this if your Page doesn't appear in the dropdown.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>{t.ad.primaryText}</Label>
                            <Textarea
                                value={values.primary_text}
                                onChange={(e) => handleChange('primary_text', e.target.value)}
                                placeholder="Tell people what your ad is about..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.ad.headline}</Label>
                            <Input
                                value={values.headline}
                                onChange={(e) => handleChange('headline', e.target.value)}
                                placeholder="Write a short headline..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.ad.destination} (URL)</Label>
                            <Input
                                value={values.link_url}
                                onChange={(e) => handleChange('link_url', e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Media Preview */}
                    <div className="space-y-4">
                        <Label>{t.ad.media}</Label>

                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] bg-muted/10 relative">
                            {values.image_url ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={values.image_url}
                                        alt="Ad Preview"
                                        className="max-h-[300px] w-auto object-contain rounded-md shadow-sm"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                        onClick={() => handleChange('image_url', '')}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <div className="space-y-2 flex flex-col items-center gap-2">
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload
                                            </Button>

                                            <Dialog open={isAssetOpen} onOpenChange={setIsAssetOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="default">
                                                        <LucideImage className="mr-2 h-4 w-4" />
                                                        Asset Library
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Select from Asset Library</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid grid-cols-3 gap-4 py-4">
                                                        {assets.length === 0 ? (
                                                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                                                No assets found. Upload some in the Asset Library first.
                                                            </div>
                                                        ) : (
                                                            assets.map((asset) => (
                                                                <div
                                                                    key={asset.id}
                                                                    className="group relative aspect-video bg-muted rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                                                    onClick={() => handleSelectAsset(asset)}
                                                                >
                                                                    {asset.type === 'image' ? (
                                                                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="flex items-center justify-center h-full">
                                                                            <span className="text-xs font-bold">VIDEO</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <span className="text-white font-medium text-sm">Select</span>
                                                                    </div>
                                                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-white text-[10px] truncate px-2">
                                                                        {asset.name}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Supported: JPG, PNG, MP4</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,video/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Live Preview Card */}
                {values.name && (
                    <div className="mt-8 pt-8 border-t">
                        <Label className="mb-4 block">Facebook Feed Preview</Label>
                        <div className="max-w-[400px] mx-auto border rounded-xl overflow-hidden bg-white shadow-sm">
                            {/* Header */}
                            <div className="p-3 flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                <div>
                                    <p className="text-sm font-semibold">{pages.find(p => p.id === values.page_id)?.name || "Page Name"}</p>
                                    <p className="text-xs text-gray-500">Sponsored • <span className="globe-icon">🌍</span></p>
                                </div>
                            </div>

                            {/* Primary Text */}
                            <div className="px-3 pb-2 text-sm text-gray-800 whitespace-pre-wrap">
                                {values.primary_text || "Primary text will appear here..."}
                            </div>

                            {/* Media */}
                            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                                {values.image_url ? (
                                    <img src={values.image_url} alt="Ad media" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-sm">Media Placeholder</span>
                                )}
                            </div>

                            {/* Headline & CTA */}
                            <div className="p-3 bg-gray-50 flex justify-between items-center text-left">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-xs text-gray-500 uppercase">{new URL(values.link_url || "https://example.com").hostname}</p>
                                    <p className="text-sm font-bold truncate">{values.headline || "Headline"}</p>
                                </div>
                                <Button variant="secondary" size="sm" className="bg-gray-200 text-gray-800 hover:bg-gray-300 pointer-events-none">
                                    Learn More
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
