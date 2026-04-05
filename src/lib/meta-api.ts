export const META_API_VERSION = 'v19.0';
export const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  effective_status?: string;
}

export class MetaApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${META_GRAPH_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const textBody = await response.text();
      console.error(`Meta API Error Raw Body: ${textBody}`);
      console.error(`Meta API Response Status: ${response.status} ${response.statusText}`);

      let errorData;
      try {
        errorData = JSON.parse(textBody);
      } catch (e) {
        // Response was not JSON
        throw new Error(`Meta API Request Failed: ${response.status} ${response.statusText} - ${textBody}`);
      }

      console.error("Meta API Full Error Response:", errorData);

      const error = errorData.error || {};
      const detailedMessage = error.error_user_msg || error.message || `Meta API Error (Status ${response.status})`;
      const debugInfo = error.error_subcode ? `(Subcode: ${error.error_subcode})` : '';

      throw new Error(`${detailedMessage} ${debugInfo}`);
    }

    const data = await response.json();
    console.log(`Meta API Response [${endpoint}]:`, JSON.stringify(data, null, 2));

    if (data && data.error) {
      const error = data.error;
      const detailedMessage = error.error_user_msg || error.message || "Meta API Error";
      throw new Error(detailedMessage);
    }

    return data;
  }

  async getAdAccounts(): Promise<{ data: MetaAdAccount[] }> {
    return this.fetch<{ data: MetaAdAccount[] }>('/me/adaccounts?fields=id,name,account_id,account_status,currency');
  }

  async getCampaigns(adAccountId: string): Promise<{ data: MetaCampaign[] }> {
    // Ensure adAccountId starts with 'act_'
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    return this.fetch<{ data: MetaCampaign[] }>(`/${formattedId}/campaigns?fields=id,name,objective,status,effective_status&limit=100`);
  }

  async updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<any> {
    return this.fetch(`/${campaignId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async deleteCampaign(campaignId: string): Promise<boolean> {
    return this.fetch<{ success: boolean }>(`/${campaignId}`, {
      method: 'DELETE',
    }).then(() => true);
  }

  async createCampaign(adAccountId: string, campaignData: { name: string; objective: string; status: string; special_ad_categories: string[] }): Promise<{ id: string }> {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    return this.fetch<{ id: string }>(`/${formattedId}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async createAdSet(adAccountId: string, adSetData: any): Promise<{ id: string }> {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    return this.fetch<{ id: string }>(`/${formattedId}/adsets`, {
      method: 'POST',
      body: JSON.stringify(adSetData),
    });
  }

  async createAdCreative(adAccountId: string, creativeData: any): Promise<{ id: string }> {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    return this.fetch<{ id: string }>(`/${formattedId}/adcreatives`, {
      method: 'POST',
      body: JSON.stringify(creativeData),
    });
  }

  async createAd(adAccountId: string, adData: any): Promise<{ id: string }> {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    return this.fetch<{ id: string }>(`/${formattedId}/ads`, {
      method: 'POST',
      body: JSON.stringify(adData),
    });
  }

  async getPages(): Promise<{ data: { id: string, name: string, access_token: string }[] }> {
    return this.fetch<{ data: { id: string, name: string, access_token: string }[] }>('/me/accounts?fields=id,name,access_token');
  }

  async uploadImage(adAccountId: string, imageFile: Blob): Promise<{ images: { [key: string]: { hash: string, url: string } } }> {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const formData = new FormData();
    // Meta requires a filename for binary uploads. Defaulting to 'image.png' ensures it's treated as a file.
    formData.append('filename', imageFile, 'ad_creative_image.png');

    const url = `${META_GRAPH_URL}/${formattedId}/adimages`;
    // Log intent
    console.log(`Uploading to: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        // Content-Type is set automatically by fetch with FormData
      },
      body: formData,
    });

    if (!response.ok) {
      // Try to read text if JSON fails
      const textBody = await response.text();
      console.error(`Meta API Upload Failed [${response.status}]:`, textBody);

      try {
        const errorData = JSON.parse(textBody);
        throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
      } catch (e) {
        throw new Error(`Upload failed: ${textBody || response.statusText}`);
      }
    }

    return response.json();
  }

  async getAd(adId: string): Promise<any> {
    return this.fetch(`/${adId}?fields=id,name,status,effective_status,ad_review_feedback,creative,updated_time`);
  }
}
