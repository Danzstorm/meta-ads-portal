"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, X, Image as LucideImage, Info } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Asset } from "@/components/assets/AssetLibrary"
import { useMeta } from "@/context/meta-context"
import { toast } from "sonner"

export interface AdCreativeParams {
    name: string;
    headline: string;
    primary_text: string;
    link_url: string;
    page_id: string;
    image_url: string;
}

interface AdFormProps {
    values: AdCreativeParams;
    onChange: (values: AdCreativeParams) => void;
    lang: string;
}

export function AdForm({ values, onChange }: AdFormProps) {
    const { pages, defaultPageId, setDefaultPageId } = useMeta();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isAssetOpen, setIsAssetOpen] = useState(false);

    // Auto-fill page_id from saved default
    useEffect(() => {
        if (!values.page_id && defaultPageId) {
            onChange({ ...values, page_id: defaultPageId });
        }
    }, [defaultPageId]);

    useEffect(() => {
        if (isAssetOpen) {
            const stored = localStorage.getItem("meta_ads_assets");
            if (stored) setAssets(JSON.parse(stored));
        }
    }, [isAssetOpen]);

    const handleChange = (field: string, value: any) => {
        onChange({ ...values, [field]: value });
    };

    const handlePageIdChange = (id: string) => {
        handleChange('page_id', id);
        if (id) setDefaultPageId(id); // Remember for next time
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('image_url', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectAsset = (asset: Asset) => {
        if (asset.url.startsWith('blob:')) {
            toast.error("Este asset está desactualizado. Bórralo y súbelo de nuevo.");
            return;
        }
        onChange({ ...values, image_url: asset.url, headline: asset.name, primary_text: asset.context || values.primary_text });
        setIsAssetOpen(false);
    };

    const HEADLINE_MAX = 40;
    const TEXT_MAX = 125;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contenido del anuncio</CardTitle>
                <p className="text-sm text-muted-foreground">Esto es lo que verán las personas en Facebook e Instagram.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">

                        {/* Page ID */}
                        <div className="space-y-2">
                            <Label>Página de Facebook <span className="text-red-500">*</span></Label>
                            {pages.filter(p => !p.id.startsWith('mock')).length > 0 ? (
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                    value={values.page_id}
                                    onChange={(e) => handlePageIdChange(e.target.value)}
                                >
                                    <option value="">Selecciona tu página</option>
                                    {pages.filter(p => !p.id.startsWith('mock')).map(page => (
                                        <option key={page.id} value={page.id}>{page.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        value={values.page_id}
                                        onChange={(e) => handlePageIdChange(e.target.value)}
                                        placeholder="Ej: 61580381969642"
                                        className="font-mono"
                                    />
                                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            Encuentra tu ID en: tu página de Facebook → URL del navegador → el número después de <code>id=</code>.
                                            {defaultPageId && <span className="font-semibold"> ID guardado: {defaultPageId}</span>}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ad Name */}
                        <div className="space-y-2">
                            <Label>Nombre interno del anuncio</Label>
                            <Input
                                value={values.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Ej: Anuncio Verano 2025"
                            />
                            <p className="text-xs text-muted-foreground">Solo tú lo verás, no el público.</p>
                        </div>

                        {/* Primary Text */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Texto principal</Label>
                                <span className={`text-xs ${values.primary_text.length > TEXT_MAX ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    {values.primary_text.length}/{TEXT_MAX}
                                </span>
                            </div>
                            <Textarea
                                value={values.primary_text}
                                onChange={(e) => handleChange('primary_text', e.target.value)}
                                placeholder="Cuéntale a tu audiencia de qué trata el anuncio. Sé directo y claro."
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">Aparece encima de la imagen. Máx. {TEXT_MAX} caracteres recomendados.</p>
                        </div>

                        {/* Headline */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Título del anuncio</Label>
                                <span className={`text-xs ${values.headline.length > HEADLINE_MAX ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    {values.headline.length}/{HEADLINE_MAX}
                                </span>
                            </div>
                            <Input
                                value={values.headline}
                                onChange={(e) => handleChange('headline', e.target.value)}
                                placeholder="Ej: Aprende Data Science desde cero"
                            />
                            <p className="text-xs text-muted-foreground">Aparece debajo de la imagen en negrita. Máx. {HEADLINE_MAX} caracteres.</p>
                        </div>

                        {/* URL */}
                        <div className="space-y-2">
                            <Label>URL de destino <span className="text-red-500">*</span></Label>
                            <Input
                                value={values.link_url}
                                onChange={(e) => handleChange('link_url', e.target.value)}
                                placeholder="https://tusitio.com"
                                type="url"
                            />
                            <p className="text-xs text-muted-foreground">¿A dónde van las personas cuando hacen clic en el anuncio?</p>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Imagen del anuncio <span className="text-red-500">*</span></Label>
                            <p className="text-xs text-muted-foreground">Recomendado: 1080x1080px (cuadrada) o 1200x628px (horizontal). JPG o PNG.</p>
                        </div>

                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[280px] bg-muted/10 relative">
                            {values.image_url ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={values.image_url}
                                        alt="Vista previa"
                                        className="max-h-[280px] w-auto object-contain rounded-md shadow-sm"
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
                                    <p className="text-sm text-muted-foreground">Sube una imagen o elige de tu biblioteca</p>
                                    <div className="flex gap-2 justify-center">
                                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Subir imagen
                                        </Button>
                                        <Dialog open={isAssetOpen} onOpenChange={setIsAssetOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="default">
                                                    <LucideImage className="mr-2 h-4 w-4" />
                                                    Mis imágenes
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Biblioteca de imágenes</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid grid-cols-3 gap-4 py-4">
                                                    {assets.length === 0 ? (
                                                        <div className="col-span-full text-center py-8 text-muted-foreground">
                                                            No tienes imágenes guardadas. Sube algunas en "Asset Library".
                                                        </div>
                                                    ) : assets.map((asset) => (
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
                                                                <span className="text-white font-medium text-sm">Seleccionar</span>
                                                            </div>
                                                            <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-white text-[10px] truncate px-2">
                                                                {asset.name}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                {values.name && (
                    <div className="mt-6 pt-6 border-t">
                        <Label className="mb-4 block">Vista previa — Feed de Facebook</Label>
                        <div className="max-w-[400px] mx-auto border rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="p-3 flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {pages.find(p => p.id === values.page_id)?.name || "Tu Página"}
                                    </p>
                                    <p className="text-xs text-gray-500">Patrocinado · 🌍</p>
                                </div>
                            </div>
                            <div className="px-3 pb-2 text-sm text-gray-800 whitespace-pre-wrap">
                                {values.primary_text || "Tu texto principal aparecerá aquí..."}
                            </div>
                            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                                {values.image_url ? (
                                    <img src={values.image_url} alt="Vista previa" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-sm">Tu imagen aquí</span>
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 flex justify-between items-center">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-xs text-gray-500 uppercase">
                                        {values.link_url ? (() => { try { return new URL(values.link_url).hostname } catch { return values.link_url } })() : 'tusitio.com'}
                                    </p>
                                    <p className="text-sm font-bold truncate">{values.headline || "Tu título aquí"}</p>
                                </div>
                                <Button variant="secondary" size="sm" className="bg-gray-200 text-gray-800 pointer-events-none">
                                    Más info
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
