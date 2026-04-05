"use client";

import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MetaLoginButtonProps {
    onLogin: (accessToken: string) => void;
}

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

export function MetaLoginButton({ onLogin }: MetaLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [sdkLoaded, setSdkLoaded] = useState(false);

    useEffect(() => {
        // Check if SDK is already loaded
        if (window.FB) {
            setSdkLoaded(true);
            return;
        }

        // Wait for SDK to load (handled in MetaContext generally, but good to check)
        const checkFB = setInterval(() => {
            if (window.FB) {
                setSdkLoaded(true);
                clearInterval(checkFB);
            }
        }, 500);

        return () => clearInterval(checkFB);
    }, []);

    const handleLogin = () => {
        if (!window.FB) {
            toast.error("Facebook SDK not loaded yet. Please refresh.");
            return;
        }

        setIsLoading(true);
        window.FB.login((response: any) => {
            setIsLoading(false);
            if (response.authResponse) {
                // User authorized
                const accessToken = response.authResponse.accessToken;
                onLogin(accessToken);
                toast.success("Successfully connected to Facebook!");
            } else {
                // User cancelled
                toast.error("Login cancelled or failed.");
            }
        }, {
            scope: 'public_profile,email,ads_management,pages_show_list,pages_read_engagement,business_management',
            return_scopes: true
        });
    };

    return (
        <Button
            onClick={handleLogin}
            disabled={isLoading || !sdkLoaded}
            className="w-full bg-[#1877F2] hover:bg-[#1864D9] text-white"
        >
            <Facebook className="mr-2 h-4 w-4" />
            {isLoading ? "Connecting..." : "Log in with Facebook"}
        </Button>
    );
}
