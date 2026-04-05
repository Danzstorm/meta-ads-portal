"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";

export interface Asset {
    id: string;
    name: string;
    url: string;
    context: string;
    type: 'image' | 'video';
    createdAt: number;
}

export function AssetLibrary() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // New Asset Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [assetContext, setAssetContext] = useState("");
    const [assetName, setAssetName] = useState("");

    // Load assets from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("meta_ads_assets");
        if (stored) {
            setAssets(JSON.parse(stored));
        }
    }, []);

    // Save assets to localStorage whenever they change
    useEffect(() => {
        if (assets.length > 0) {
            localStorage.setItem("meta_ads_assets", JSON.stringify(assets));
        }
    }, [assets]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setSelectedFile(file);
            // setAssetName(file.name.split('.')[0]); // Removed per user request to allow manual entry

            // Convert to Base64 for persistence
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAsset = () => {
        if (!selectedFile || !assetContext.trim() || !previewUrl) {
            toast.error("Please select an image, wait for it to load, and provide context.");
            return;
        }

        const newAsset: Asset = {
            id: crypto.randomUUID(),
            name: assetName,
            url: previewUrl, // In a real app, upload to S3/Cloudinary and get real URL
            context: assetContext,
            type: selectedFile.type.startsWith('video') ? 'video' : 'image',
            createdAt: Date.now()
        };

        setAssets([newAsset, ...assets]);

        // Reset form
        setSelectedFile(null);
        setPreviewUrl("");
        setAssetContext("");
        setAssetName("");
        setIsUploading(false);

        toast.success("Asset saved to library!");
    };

    const handleDeleteAsset = (id: string) => {
        const updated = assets.filter(a => a.id !== id);
        setAssets(updated);
        localStorage.setItem("meta_ads_assets", JSON.stringify(updated)); // Force update
        toast.success("Asset deleted.");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Asset Library</h2>
                    <p className="text-muted-foreground">Upload creatives and add context for the AI Agent.</p>
                </div>
                <Button onClick={() => setIsUploading(!isUploading)}>
                    {isUploading ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {isUploading ? "Cancel" : "Add Asset"}
                </Button>
            </div>

            {/* Upload Form */}
            {isUploading && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle>New Asset</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileSelect}
                                />
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-[200px] rounded object-contain" />
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                        <p className="text-sm font-medium">Click to upload image/video</p>
                                        <p className="text-xs text-muted-foreground">JPG, PNG, MP4</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Asset Name</Label>
                                <Input
                                    value={assetName}
                                    onChange={(e) => setAssetName(e.target.value)}
                                    placeholder="e.g., Summer Shoes Product Shot"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>AI Context (Description)</Label>
                                <Textarea
                                    value={assetContext}
                                    onChange={(e) => setAssetContext(e.target.value)}
                                    placeholder="Describe this product for the AI. Include details like: Product Name, Key Benefit, Offer/Discount, Target Audience."
                                    className="min-h-[120px]"
                                />
                                <p className="text-xs text-muted-foreground">
                                    The AI will use this text to generate the Headline and Primary Text for ads using this image.
                                </p>
                            </div>
                            <Button className="w-full" onClick={handleSaveAsset}>Save Asset</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.length === 0 && !isUploading && (
                    <div className="col-span-full text-center p-12 border border-dashed rounded-lg">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No assets yet</h3>
                        <p className="text-muted-foreground">Upload your first asset to get started.</p>
                    </div>
                )}

                {assets.map((asset) => (
                    <Card key={asset.id} className="overflow-hidden group">
                        <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
                            {asset.type === 'image' ? (
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="text-muted-foreground flex flex-col items-center">
                                    <ImageIcon className="h-10 w-10" />
                                    <span className="text-xs mt-2">VIDEO</span>
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4 space-y-2">
                            <h4 className="font-semibold truncate" title={asset.name}>{asset.name}</h4>
                            <div className="bg-muted p-2 rounded text-xs text-muted-foreground h-[60px] overflow-y-auto">
                                <span className="font-semibold text-primary">Context: </span>
                                {asset.context}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
                            <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAsset(asset.id)}>
                                Delete
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
