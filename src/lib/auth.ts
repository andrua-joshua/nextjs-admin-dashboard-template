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
