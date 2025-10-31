// API client for Cloudflare Workers backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchBodyTypes() {
  const response = await fetch(`${API_URL}/api/body-types`);
  if (!response.ok) {
    throw new Error('Failed to fetch body types');
  }
  return response.json();
}

export async function fetchRankedItems(bodyType: string, topN: number = 10) {
  const response = await fetch(`${API_URL}/api/rank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body_type: bodyType, top_n: topN }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch ranked items');
  }
  
  return response.json();
}

export async function generateOutfits(formData: {
  body_type: string;
  colors?: string;
  preferences?: string;
  budget?: string;
  gender?: string;
  age_group?: string;
  occupation?: string;
  height?: string;
  preferred_fit?: string;
  reference_image_base64?: string | null;
  reference_item_description?: string;
}) {
  const response = await fetch(`${API_URL}/api/generate-outfits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate outfits');
  }
  const data = response.json();
  console.log(data);
  return data;
}

export async function healthCheck() {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error('API health check failed');
  }
  return response.json();
}



