const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// Helper function to get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  signUp: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'user' | 'organizer';
    organizationName?: string;
  }) => {
    const response = await apiRequest<{ token: string; user: any; message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  signIn: async (data: { email: string; password: string; role?: 'user' | 'organizer' }) => {
    const response = await apiRequest<{ token: string; user: any; message: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  getMe: async () => {
    return apiRequest<{ user: any }>('/auth/me');
  },

  signOut: () => {
    removeToken();
  },

  // OTP-based authentication
  requestLoginOTP: async (data: { email: string; role?: 'user' | 'organizer' }) => {
    return apiRequest<{ message: string; email: string }>('/auth/request-login-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyLoginOTP: async (data: { email: string; otp: string; role?: 'user' | 'organizer' }) => {
    const response = await apiRequest<{ token: string; user: any; message: string }>('/auth/verify-login-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  // Password reset
  requestPasswordResetOTP: async (data: { email: string; role?: 'user' | 'organizer' }) => {
    return apiRequest<{ message: string; email: string }>('/auth/request-password-reset-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPasswordWithOTP: async (data: {
    email: string;
    otp: string;
    newPassword: string;
    role?: 'user' | 'organizer';
  }) => {
    return apiRequest<{ message: string; user: any }>('/auth/reset-password-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Phone verification
  requestPhoneVerificationOTP: async (data: {
    email: string;
    phone: string;
    role?: 'user' | 'organizer';
  }) => {
    return apiRequest<{ message: string; email: string }>('/auth/request-phone-verification-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyPhoneWithOTP: async (data: {
    email: string;
    otp: string;
    phone: string;
    role?: 'user' | 'organizer';
  }) => {
    return apiRequest<{ message: string; user: any }>('/auth/verify-phone-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Events API
export const eventsAPI = {
  getEvents: async (params?: { status?: string; category?: string; organizerId?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.organizerId) queryParams.append('organizerId', params.organizerId.toString());
    
    const query = queryParams.toString();
    return apiRequest<{ events: any[] }>(`/events${query ? `?${query}` : ''}`);
  },

  getEvent: async (id: number | string) => {
    return apiRequest<{ event: any }>(`/events/${id}`);
  },

  createEvent: async (data: {
    title: string;
    description?: string;
    category: string;
    date: string;
    location: string;
    price: number;
    imageUrl?: string;
    totalTickets?: number;
    bookingExpiry: string;
  }) => {
    return apiRequest<{ event: any; message: string }>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (id: number | string, data: {
    title?: string;
    description?: string;
    category?: string;
    date?: string;
    location?: string;
    price?: number;
    imageUrl?: string;
    totalTickets?: number;
    bookingExpiry?: string;
  }) => {
    return apiRequest<{ event: any; message: string }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (id: number | string) => {
    return apiRequest<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  getMyEvents: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<{ events: any[] }>(`/events/organizer/my-events${query}`);
  },
};

// Users API
export const usersAPI = {
  getUser: async (id: number) => {
    return apiRequest<{ user: any }>(`/users/${id}`);
  },

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    organizationName?: string;
  }) => {
    return apiRequest<{ user: any; message: string }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiRequest<{ message: string }>('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Bookings API
export const bookingsAPI = {
  createBooking: async (data: {
    eventId: string;
    quantity: number;
    attendeeDetails: Array<{
      name: string;
      email: string;
      phone: string;
    }>;
  }) => {
    return apiRequest<{ 
      booking: any; 
      razorpayKey: string;
      message: string;
    }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyPayment: async (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    bookingId: string;
  }) => {
    return apiRequest<{ booking: any; message: string }>('/bookings/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUserBookings: async () => {
    return apiRequest<{ bookings: any[] }>('/bookings/my-bookings');
  },

  getBookingDetails: async (id: string) => {
    return apiRequest<{ booking: any }>(`/bookings/${id}`);
  },

  cancelBooking: async (id: string) => {
    return apiRequest<{ booking: any; message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  getEventBookings: async (eventId: string) => {
    return apiRequest<{ bookings: any[]; analytics: any }>(`/bookings/event/${eventId}/bookings`);
  },

  getOrganizerBookings: async () => {
    return apiRequest<{ bookings: any[]; totalBookings: number; totalTickets: number }>('/bookings/organizer/all-bookings');
  },

  verifyTicket: async (ticketNumber: string, bookingId: string, verificationStatus: 'approved' | 'denied' = 'approved') => {
    return apiRequest<{ verified: boolean; status: string; verifiedAt: string; message: string }>('/bookings/verify-ticket', {
      method: 'POST',
      body: JSON.stringify({ ticketNumber, bookingId, verificationStatus }),
    });
  },

  getTicketVerificationStatus: async (ticketNumber: string, bookingId: string) => {
    return apiRequest<{ ticketNumber: string; isVerified: boolean; verifiedAt: string | null }>(`/bookings/ticket-status?ticketNumber=${ticketNumber}&bookingId=${bookingId}`);
  },

  cancelTicket: async (bookingId: string, ticketNumber: string) => {
    return apiRequest<{ booking: any; message: string }>('/bookings/cancel-ticket', {
      method: 'POST',
      body: JSON.stringify({ bookingId, ticketNumber }),
    });
  },
};

