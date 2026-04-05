"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MetaApiClient, MetaAdAccount } from '@/lib/meta-api';

interface MetaContextType {
    accessToken: string;
    adAccountId: string;
    defaultPageId: string;
    setAccessToken: (token: string) => void;
    setAdAccountId: (id: string) => void;
    setDefaultPageId: (id: string) => void;
    apiClient: MetaApiClient | null;
    adAccounts: MetaAdAccount[];
    refreshAdAccounts: () => Promise<void>;
    pages: { id: string, name: string }[];
    isLoading: boolean;
}

const MetaContext = createContext<MetaContextType | undefined>(undefined);

export function MetaProvider({ children }: { children: React.ReactNode }) {
    const [accessToken, setAccessTokenState] = useState('');
    const [adAccountId, setAdAccountIdState] = useState('');
    const [defaultPageId, setDefaultPageIdState] = useState('');
    const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
    const [pages, setPages] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('meta_access_token');
        const storedAccountId = localStorage.getItem('meta_ad_account_id');
        const storedPageId = localStorage.getItem('meta_default_page_id');
        const envToken = process.env.NEXT_PUBLIC_META_ACCESS_TOKEN;

        if (envToken) {
            setAccessTokenState(envToken);
            localStorage.setItem('meta_access_token', envToken);
        } else if (storedToken) {
            setAccessTokenState(storedToken);
        }

        if (storedAccountId) setAdAccountIdState(storedAccountId);
        if (storedPageId) setDefaultPageIdState(storedPageId);

        const loadFbSdk = () => {
            if (window.FB) return;
            window.fbAsyncInit = function () {
                window.FB.init({
                    appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
                    cookie: true,
                    xfbml: true,
                    version: 'v19.0'
                });
            };
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) { return; }
                js = d.createElement(s) as HTMLScriptElement; js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode!.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        };
        loadFbSdk();
    }, []);

    const setAccessToken = (token: string) => {
        setAccessTokenState(token);
        localStorage.setItem('meta_access_token', token);
    };

    const setAdAccountId = (id: string) => {
        setAdAccountIdState(id);
        localStorage.setItem('meta_ad_account_id', id);
    };

    const setDefaultPageId = (id: string) => {
        setDefaultPageIdState(id);
        localStorage.setItem('meta_default_page_id', id);
    };

    const apiClient = React.useMemo(() => {
        return accessToken ? new MetaApiClient(accessToken) : null;
    }, [accessToken]);

    const refreshAdAccounts = async () => {
        if (!apiClient) return;
        setIsLoading(true);
        try {
            const response = await apiClient.getAdAccounts();
            setAdAccounts(response.data);
            if (!adAccountId && response.data.length > 0) {
                setAdAccountId(response.data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch ad accounts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshPages = async () => {
        if (!apiClient) return;
        try {
            const response = await apiClient.getPages();
            if (response.data.length > 0) {
                setPages(response.data);
                // Auto-save first page as default if none set
                if (!defaultPageId) {
                    setDefaultPageId(response.data[0].id);
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch pages", error);
        }
    };

    useEffect(() => {
        if (accessToken) {
            refreshAdAccounts();
            refreshPages();
        }
    }, [accessToken]);

    return (
        <MetaContext.Provider value={{
            accessToken,
            adAccountId,
            defaultPageId,
            setAccessToken,
            setAdAccountId,
            setDefaultPageId,
            apiClient,
            adAccounts,
            refreshAdAccounts,
            pages,
            isLoading
        }}>
            {children}
        </MetaContext.Provider>
    );
}

export const useMeta = () => {
    const context = useContext(MetaContext);
    if (context === undefined) {
        throw new Error('useMeta must be used within a MetaProvider');
    }
    return context;
};
