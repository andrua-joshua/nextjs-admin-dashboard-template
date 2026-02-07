import { 
  getApiUrl, 
  API_CONFIG, 
  LoginRequest, 
  LoginResponse, 
  GetProfileResponse, 
  UpdateUserRequest,
  UpdateUserResponse,
  GetAllUsersResponse,
  GetAllOpportunitiesResponse,
  FilteredOpportunitiesResponse,
  OpportunitiesCountResponse,
  GetUserReviewsResponse,
  GetProviderReviewsResponse,
  GetAllProvidersResponse,
  GetProviderByServiceResponse,
  GetProviderByLocationResponse,
  ProvidersCountResponse,
  SearchProviderResponse,
  FilterProvidersResponse,
  GetProviderByUserIdResponse,
  GetAllKycResponse,
  UpdateKycStatusRequest,
  UpdateKycStatusResponse,
  GetAllOffersResponse,
  GetOffersByProviderResponse,
  GetOffersByOpportunityResponse,
  GetOffersByProviderAndStatusResponse,
  GetProviderActiveAndInProgressOffersResponse,
  GetOffersByUserAndStatusResponse,
  GetOffersByProviderAndStatusExpressResponse
} from '@/config/api';

// Inject device headers into all client-side fetch requests.
// Values are derived from the client's device where possible and persisted locally.
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const detectDeviceType = (ua: string) => {
    if (/Mobi|Android|iPhone/.test(ua)) return 'Mobile';
    if (/iPad|Tablet/.test(ua)) return 'Tablet';
    return 'Desktop';
  };

  const detectDeviceModel = (ua: string) => {
    // Try iPhone/iPad
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';

    // Try Android model extraction (common pattern: "Android 10; Pixel 3 Build/...")
    const androidMatch = ua.match(/Android[^;]*;\s*([^;\)]+)\)?/i);
    if (androidMatch && androidMatch[1]) return androidMatch[1].trim();

    // Fallbacks
    return navigator.platform || ua.split(' ')[0] || 'Unknown';
  };

  // Ensure a persistent device id per browser/device
  let persistedDeviceId = localStorage.getItem('X-Device-ID') || localStorage.getItem('device_id');
  if (!persistedDeviceId) {
    persistedDeviceId = generateUUID();
    try {
      localStorage.setItem('X-Device-ID', persistedDeviceId);
    } catch (e) {
      // ignore
    }
  }

  const ua = navigator.userAgent || '';
  const defaultDeviceId = persistedDeviceId || process.env.NEXT_PUBLIC_DEVICE_ID || 'device-123';
  const defaultDeviceType = (localStorage.getItem('X-Device-Type') || process.env.NEXT_PUBLIC_DEVICE_TYPE) || detectDeviceType(ua);
  const defaultDeviceModel = (localStorage.getItem('X-Device-Model') || process.env.NEXT_PUBLIC_DEVICE_MODEL) || detectDeviceModel(ua);

  window.fetch = (input: RequestInfo, init?: RequestInit) => {
    const newInit: RequestInit = { ...(init || {}) };
    const existing = new Headers(init && init.headers ? init.headers as HeadersInit : undefined);

    // Allow explicit overrides via localStorage (useful for testing) but otherwise use detected values
    const deviceId = localStorage.getItem('X-Device-ID') || localStorage.getItem('device_id') || defaultDeviceId;
    const deviceType = localStorage.getItem('X-Device-Type') || localStorage.getItem('device_type') || defaultDeviceType;
    const deviceModel = localStorage.getItem('X-Device-Model') || localStorage.getItem('device_model') || defaultDeviceModel;

    existing.set('X-Device-ID', deviceId);
    existing.set('X-Device-Type', deviceType);
    existing.set('X-Device-Model', deviceModel);

    newInit.headers = existing;
    return originalFetch(input, newInit);
  };
}

// Token management
export const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// API functions
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getProfile = async (): Promise<GetProfileResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_PROFILE), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetProfileResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get profile by ID error:', error);
    throw error;
  }
};

// Get user reviews

// KYC Functions
export const getAllKyc = async (page: number = 0, size: number = 10): Promise<GetAllKycResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_ALL_KYC) + `?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetAllKycResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get all KYC error:', error);
    throw error;
  }
};

export const updateKycStatus = async (userId: number, statusData: UpdateKycStatusRequest): Promise<UpdateKycStatusResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_KYC_STATUS) + `/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: UpdateKycStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Update KYC status error:', error);
    throw error;
  }
};

// Get user reviews
export const getUserReviews = async (userId: number, page: number = 0, size: number = 10): Promise<GetUserReviewsResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_USER_REVIEWS}/${userId}?page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetUserReviewsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get user reviews error:', error);
    throw error;
  }
};

// Get all providers
export const getAllProviders = async (page: number = 0, size: number = 10): Promise<GetAllProvidersResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_ALL_PROVIDERS}?page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetAllProvidersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get all providers error:', error);
    throw error;
  }
};

// Get provider reviews
export const getProviderReviews = async (providerId: number, page: number = 0, size: number = 10): Promise<GetProviderReviewsResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_PROVIDER_REVIEWS}/${providerId}?page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetProviderReviewsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get provider reviews error:', error);
    throw error;
  }
};

// Get providers by service
export const getProviderByService = async (query: string, page: number = 0, size: number = 10): Promise<GetProviderByServiceResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_PROVIDER_BY_SERVICE}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetProviderByServiceResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get providers by service error:', error);
    throw error;
  }
};


// Get providers count by category
export const getProvidersCountByCategory = async (category: string): Promise<ProvidersCountResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_PROVIDERS_COUNT_BY_CATEGORY}?category=${encodeURIComponent(category)}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ProvidersCountResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get providers count by category error:', error);
    throw error;
  }
};


// Get providers by location
export const getProviderByLocation = async (query: string, page: number = 0, size: number = 10): Promise<GetProviderByLocationResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_PROVIDER_BY_LOCATION}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetProviderByLocationResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get providers by location error:', error);
    throw error;
  }
};


// Categories
export const getAllCategories = async (page: number = 0, size: number = 10, sortBy: string = 'title') => {
  const token = getToken();
  try {
    const url = getApiUrl(`${API_CONFIG.ENDPOINTS.GET_ALL_CATEGORIES}?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get all categories error:', error);
    throw error;
  }
};


export const searchCategory = async (query: string) => {
  try {
    const url = getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_CATEGORY}?query=${encodeURIComponent(query)}`);
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Search category error:', error);
    throw error;
  }
};


export const addCategory = async (payload: { title: string; description?: string | null; icon?: string | File | null; childTo?: number | null }) => {
  const token = getToken();
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    if (payload.childTo !== undefined && payload.childTo !== null) formData.append('childTo', String(payload.childTo));
    
    // Handle icon - can be File or string, use 'file' field name
    if (payload.icon) {
      if (payload.icon instanceof File) {
        formData.append('file', payload.icon);
      } else if (typeof payload.icon === 'string') {
        formData.append('icon', payload.icon);
      }
    }

    const headers: any = token ? { 'Authorization': `Bearer ${token}` } : {};
    // Don't set Content-Type for FormData - browser will set it with boundary

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADD_CATEGORY), {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Add category error:', error);
    throw error;
  }
};


export const updateCategory = async (id: number, payload: { title?: string; description?: string | null; icon?: string | File | null; childTo?: number | null }) => {
  const token = getToken();
  try {
    const formData = new FormData();
    formData.append('id', String(id));
    if (payload.title) formData.append('title', payload.title);
    if (payload.description !== undefined) formData.append('description', payload.description || '');
    if (payload.childTo !== undefined && payload.childTo !== null) formData.append('childTo', String(payload.childTo));
    
    // Handle icon - can be File or string, use 'file' field name
    if (payload.icon) {
      if (payload.icon instanceof File) {
        formData.append('file', payload.icon);
      } else if (typeof payload.icon === 'string') {
        formData.append('icon', payload.icon);
      }
    }

    const headers: any = token ? { 'Authorization': `Bearer ${token}` } : {};
    // Don't set Content-Type for FormData - browser will set it with boundary

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_CATEGORY), {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};


export const deleteCategory = async (id: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_CATEGORY)}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};


// Locations
export const getCountries = async () => {
  const token = getToken();
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_COUNTRIES), {
      method: 'GET',
      headers: token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('Forbidden: you do not have access to view countries');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get countries error:', error);
    throw error;
  }
};


export const getDistricts = async (country?: number, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const countryQuery = country ? `&country=${country}` : '';
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_DISTRICTS}?page=${page}&size=${size}${countryQuery}`), {
      method: 'GET',
      headers: token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('Forbidden: you do not have access to view districts');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get districts error:', error);
    throw error;
  }
};

export const getCounties = async (district?: number, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const districtQuery = district ? `&district=${district}` : '';
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_COUNTIES}?page=${page}&size=${size}${districtQuery}`), {
      method: 'GET',
      headers: token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('Forbidden: you do not have access to view counties');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get counties error:', error);
    throw error;
  }
};

export const getSubcounties = async (county?: number, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const countyQuery = county ? `&county=${county}` : '';
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_SUBCOUNTIES}?page=${page}&size=${size}${countyQuery}`), {
      method: 'GET',
      headers: token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('Forbidden: you do not have access to view subcounties');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get subcounties error:', error);
    throw error;
  }
};

export const getParishes = async (subcounty?: number, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const subcountyQuery = subcounty ? `&subcounty=${subcounty}` : '';
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_PARISHES}?page=${page}&size=${size}${subcountyQuery}`), {
      method: 'GET',
      headers: token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('Forbidden: you do not have access to view parishes');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get parishes error:', error);
    throw error;
  }
};

export const getVillages = async (parish?: number, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const parishQuery = parish ? `&parish=${parish}` : '';
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_VILLAGES}?page=${page}&size=${size}${parishQuery}`), {
      method: 'GET',
      headers: token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('Forbidden: you do not have access to view villages');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get villages error:', error);
    throw error;
  }
};

// Locations CRUD helpers
export const searchCountries = async (query: string) => {
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_COUNTRIES}?query=${encodeURIComponent(query)}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Search countries error:', error);
    throw error;
  }
};

export const addDistrict = async (name: string, countryId: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ADD_DISTRICT)}?name=${encodeURIComponent(name)}&country=${encodeURIComponent(String(countryId))}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Add district error:', error);
    throw error;
  }
};

export const addCountry = async (name: string) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ADD_COUNTRY)}?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Add country error:', error);
    throw error;
  }
};

export const updateCountry = async (id: number, name: string) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_COUNTRY)}/${id}?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Update country error:', error);
    throw error;
  }
};

export const deleteCountry = async (id: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_COUNTRY)}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Delete country error:', error);
    throw error;
  }
};

export const updateDistrict = async (id: number, name: string) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_DISTRICT)}/${id}?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Update district error:', error);
    throw error;
  }
};

export const deleteDistrict = async (id: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_DISTRICT)}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Delete district error:', error);
    throw error;
  }
};

// County
export const addCounty = async (name: string, districtId: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ADD_COUNTY)}?name=${encodeURIComponent(name)}&district=${encodeURIComponent(String(districtId))}`;
    const response = await fetch(url, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Add county error:', error);
    throw error;
  }
};

export const updateCounty = async (id: number, name: string) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_COUNTY)}/${id}?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Update county error:', error);
    throw error;
  }
};

export const deleteCounty = async (id: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_COUNTY)}/${id}`;
    const response = await fetch(url, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Delete county error:', error);
    throw error;
  }
};

// Subcounty
export const addSubcounty = async (name: string, countyId: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ADD_SUBCOUNTY)}?name=${encodeURIComponent(name)}&county=${encodeURIComponent(String(countyId))}`;
    const response = await fetch(url, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Add subcounty error:', error);
    throw error;
  }
};

export const updateSubcounty = async (id: number, name: string) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_SUBCOUNTY)}/${id}?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Update subcounty error:', error);
    throw error;
  }
};

export const deleteSubcounty = async (id: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_SUBCOUNTY)}/${id}`;
    const response = await fetch(url, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Delete subcounty error:', error);
    throw error;
  }
};

// Parish
export const addParish = async (name: string, subcountyId: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ADD_PARISH)}?name=${encodeURIComponent(name)}&subcounty=${encodeURIComponent(String(subcountyId))}`;
    const response = await fetch(url, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Add parish error:', error);
    throw error;
  }
};

export const updateParish = async (id: number, name: string) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PARISH)}/${id}?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Update parish error:', error);
    throw error;
  }
};

export const deleteParish = async (id: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_PARISH)}/${id}`;
    const response = await fetch(url, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Delete parish error:', error);
    throw error;
  }
};

// Village
export const addVillage = async (name: string, parishId: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ADD_VILLAGE)}?name=${encodeURIComponent(name)}&parish=${encodeURIComponent(String(parishId))}`;
    const response = await fetch(url, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Add village error:', error);
    throw error;
  }
};

export const updateVillage = async (id: number, name: string) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_VILLAGE)}/${id}?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Update village error:', error);
    throw error;
  }
};

export const deleteVillage = async (id: number) => {
  const token = getToken();
  try {
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_VILLAGE)}/${id}`;
    const response = await fetch(url, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Delete village error:', error);
    throw error;
  }
};

// Search helpers for locations
export const searchDistricts = async (query: string, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_DISTRICTS}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Search districts failed');
    return await response.json();
  } catch (error) {
    console.error('Search districts error:', error);
    throw error;
  }
};

export const searchCounties = async (query: string, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_COUNTIES}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Search counties failed');
    return await response.json();
  } catch (error) {
    console.error('Search counties error:', error);
    throw error;
  }
};

export const searchSubcounties = async (query: string, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_SUBCOUNTIES}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Search subcounties failed');
    return await response.json();
  } catch (error) {
    console.error('Search subcounties error:', error);
    throw error;
  }
};

export const searchParishes = async (query: string, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_PARISHES}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Search parishes failed');
    return await response.json();
  } catch (error) {
    console.error('Search parishes error:', error);
    throw error;
  }
};

export const searchVillages = async (query: string, page: number = 0, size: number = 10) => {
  const token = getToken();
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_VILLAGES}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Search villages failed');
    return await response.json();
  } catch (error) {
    console.error('Search villages error:', error);
    throw error;
  }
};

// Referral
export const generateReferral = async () => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REFERRAL_GENERATE), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Generate referral error:', error);
    throw error;
  }
};

export const getMyReferralCodes = async () => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REFERRAL_MY_CODES), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get my referral codes error:', error);
    throw error;
  }
};

export const claimReferral = async (code: string) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REFERRAL_CLAIM), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: code }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Claim referral error:', error);
    throw error;
  }
};

export const getReferralClaims = async (code: string) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.REFERRAL_CLAIMS}/${encodeURIComponent(code)}`), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get referral claims error:', error);
    throw error;
  }
};

export const getMyReferralClaims = async () => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REFERRAL_MY_CLAIMS), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get my referral claims error:', error);
    throw error;
  }
};

export const getReferralDetails = async (code: string) => {
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.REFERRAL_DETAILS}/${encodeURIComponent(code)}`));
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get referral details error:', error);
    throw error;
  }
};

// Wallets
export const getUserWalletAccount = async () => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_USER_WALLET_ACCOUNT), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get user wallet account error:', error);
    throw error;
  }
};

export const getUserTransactions = async (page: number = 0, size: number = 10) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_USER_TRANSACTIONS}?page=${page}&size=${size}`), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get user transactions error:', error);
    throw error;
  }
};

export const makeDeposit = async (payload: any) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.MAKE_DEPOSIT), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Make deposit error:', error);
    throw error;
  }
};

export const makeWithdraw = async (payload: any) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.MAKE_WITHDRAW), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Make withdraw error:', error);
    throw error;
  }
};

// Search providers
export const searchProvider = async (query: string, page: number = 0, size: number = 10): Promise<SearchProviderResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_PROVIDER}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: SearchProviderResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Search providers error:', error);
    throw error;
  }
};

// Filter providers
export const filterProviders = async (query?: string, kycVerification?: string, page: number = 0, size: number = 10): Promise<FilterProvidersResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    let url = `${API_CONFIG.ENDPOINTS.FILTER_PROVIDERS}?page=${page}&size=${size}`;
    
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }
    
    if (kycVerification) {
      url += `&kycVerification=${encodeURIComponent(kycVerification)}`;
    }
    
    const response = await fetch(getApiUrl(url), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: FilterProvidersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Filter providers error:', error);
    throw error;
  }
};

// Get provider by user ID
export const getProviderByUserId = async (userId: number): Promise<GetProviderByUserIdResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_PROVIDER_BY_USER_ID}/${userId}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetProviderByUserIdResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get provider by user ID error:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Logout function
export const logout = (): void => {
  removeToken();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

// Update user profile
export const updateUser = async (userData: UpdateUserRequest): Promise<UpdateUserResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_USER), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: UpdateUserResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// Get all users with pagination
export const getAllUsers = async (page: number = 0, size: number = 10): Promise<GetAllUsersResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_ALL_USERS}?page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetAllUsersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

// Get profile by ID
export const getProfileById = async (id: number): Promise<GetProfileResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_PROFILE_BY_ID}/${id}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetProfileResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get profile by ID error:', error);
    throw error;
  }
};

// Get all opportunities
export const getAllOpportunities = async (): Promise<GetAllOpportunitiesResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_ALL_OPPORTUNITIES), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetAllOpportunitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get all opportunities error:', error);
    throw error;
  }
};

// Filter opportunities
export const filterOpportunities = async (
  searchQuery?: string,
  minBudget?: number,
  maxBudget?: number,
  page: number = 0
): Promise<FilteredOpportunitiesResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    if (minBudget !== undefined) params.append('min', minBudget.toString());
    if (maxBudget !== undefined) params.append('max', maxBudget.toString());
    params.append('page', page.toString());

    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.FILTER_OPPORTUNITIES}?${params}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: FilteredOpportunitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Filter opportunities error:', error);
    throw error;
  }
};

// Get opportunities by location
export const getOpportunitiesByLocation = async (location: string, page: number = 0): Promise<FilteredOpportunitiesResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_OPPORTUNITIES_BY_LOCATION}?query=${encodeURIComponent(location)}&page=${page}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: FilteredOpportunitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get opportunities by location error:', error);
    throw error;
  }
};

// Get opportunities by service
export const getOpportunitiesByService = async (service: string, page: number = 0): Promise<FilteredOpportunitiesResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_OPPORTUNITIES_BY_SERVICE}?query=${encodeURIComponent(service)}&page=${page}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: FilteredOpportunitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get opportunities by service error:', error);
    throw error;
  }
};

// Get opportunities count by category
export const getOpportunitiesCountByCategory = async (category: string): Promise<OpportunitiesCountResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_OPPORTUNITIES_COUNT_BY_CATEGORY}?category=${encodeURIComponent(category)}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: OpportunitiesCountResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get opportunities count by category error:', error);
    throw error;
  }
};

// Get user opportunities
export const getUserOpportunities = async (userId: number, page: number = 0): Promise<FilteredOpportunitiesResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_USER_OPPORTUNITIES}/${userId}?page=${page}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: FilteredOpportunitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get user opportunities error:', error);
    throw error;
  }
};

// Search opportunities
export const searchOpportunities = async (query: string, page: number = 0): Promise<FilteredOpportunitiesResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SEARCH_OPPORTUNITIES}?query=${encodeURIComponent(query)}&page=${page}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: FilteredOpportunitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Search opportunities error:', error);
    throw error;
  }
};

// ===== CONTRACT API FUNCTIONS =====

// Get all contracts/offers
export const getAllOffers = async (): Promise<GetAllOffersResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_ALL_OFFERS), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetAllOffersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get all offers error:', error);
    throw error;
  }
};

// Get offers by provider
export const getOffersByProvider = async (providerId: number, page: number = 0, size: number = 10): Promise<GetOffersByProviderResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_OFFERS_BY_PROVIDER}/${providerId}?page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetOffersByProviderResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get offers by provider error:', error);
    throw error;
  }
};

// Get offers by opportunity
export const getOffersByOpportunity = async (opportunityId: number, page: number = 0, size: number = 10): Promise<GetOffersByOpportunityResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_OFFERS_BY_OPPORTUNITY}/${opportunityId}?page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetOffersByOpportunityResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get offers by opportunity error:', error);
    throw error;
  }
};

// Get offers by provider and status
export const getOffersByProviderAndStatus = async (providerId: number, status: string, page: number = 0, size: number = 10): Promise<GetOffersByProviderAndStatusResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_OFFERS_BY_PROVIDER_AND_STATUS}/${providerId}?status=${status}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetOffersByProviderAndStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get offers by provider and status error:', error);
    throw error;
  }
};

// Get provider active and in-progress offers
export const getProviderActiveAndInProgressOffers = async (providerId: number, page: number = 0, size: number = 10): Promise<GetProviderActiveAndInProgressOffersResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_PROVIDER_ACTIVE_AND_INPROGRESS_OFFERS}/${providerId}?page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetProviderActiveAndInProgressOffersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get provider active and in-progress offers error:', error);
    throw error;
  }
};

// ===== EXPRESS OFFERS API FUNCTIONS =====

// Get express offers by user and status
export const getOffersByUserAndStatus = async (status: string, page: number = 0, size: number = 10): Promise<GetOffersByUserAndStatusResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_OFFERS_BY_USER_AND_STATUS}?status=${status}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetOffersByUserAndStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get offers by user and status error:', error);
    throw error;
  }
};

// Get express offers by provider and status
export const getOffersByProviderAndStatusExpress = async (providerId: number, status: string, page: number = 0, size: number = 10): Promise<GetOffersByProviderAndStatusExpressResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.GET_OFFERS_BY_PROVIDER_AND_STATUS_EXPRESS}?provider=${providerId}&status=${status}&page=${page}&size=${size}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetOffersByProviderAndStatusExpressResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get offers by provider and status (express) error:', error);
    throw error;
  }
};
