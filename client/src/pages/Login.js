import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/animations.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'buyer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsForgotPassword(true);
      } else if (event === 'SIGNED_IN') {
        // Only navigate if not in password recovery mode
        if (!isForgotPassword) {
          navigate('/');
        }
      }
    });

    // Cleanup subscription
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [navigate, isForgotPassword]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';

    // Length check
    if (password.length >= 8) score += 1;
    // Contains number
    if (/\d/.test(password)) score += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) score += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 1;
    // Contains special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        message = 'Very Weak';
        break;
      case 2:
        message = 'Weak';
        break;
      case 3:
        message = 'Medium';
        break;
      case 4:
        message = 'Strong';
        break;
      case 5:
        message = 'Very Strong';
        break;
      default:
        message = '';
    }

    setPasswordStrength({ score, message });
  };

  // Phone number formatter
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    
    if (name === 'phone') {
      setFormData(prev => ({
        ...prev,
        [name]: formatPhoneNumber(value)
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (isSignUp) {
      // Phone number validation (US format)
      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Please enter a valid phone number in the format (XXX) XXX-XXXX');
        return false;
      }

      // Password strength validation
      if (passwordStrength.score < 3) {
        setError('Password is too weak. Please use a stronger password.');
        return false;
      }
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      console.log('Starting signup process...', {
        email: formData.email,
        metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          username: `${formData.firstName} ${formData.lastName}`,
        }
      });

      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            role: formData.role,
            username: `${formData.firstName} ${formData.lastName}`,
          },
          emailRedirectTo: 'https://thiyhuatzybtmevtages.supabase.co/auth/v1/verify'
        }
      });

      console.log('Signup response:', { authData, authError });

      if (authError) {
        throw authError;
      }

      // Check if user already exists
      if (authData?.user?.identities?.length === 0) {
        setError('An account with this email already exists. Please sign in instead.');
        setIsSignUp(false); // Switch to login form
        return;
      }

      // If we get here, it's a successful new signup
      alert('Check your email for the confirmation link!');
      setIsSignUp(false); // Switch back to login form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'buyer'
      });
      setPasswordStrength({ score: 0, message: '' });
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
        data: {
          email: formData.email
        }
      });

      if (error) throw error;

      setResetEmailSent(true);
      setError(null);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D3CABE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-serif font-bold text-gray-900 tracking-tight">
            {isForgotPassword ? 'Reset Password' : 
              (isSignUp ? 'Create your account' : 'Welcome back')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            {isForgotPassword ? 'Enter your email to receive a reset link' : 
              (isSignUp ? 'Join our community of art enthusiasts' : 'Sign in to continue')}
          </p>
        </div>

        {resetEmailSent && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md animate-slideIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Password reset link has been sent to your email. Please check your inbox.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={isForgotPassword ? handleForgotPassword : (isSignUp ? handleSignUp : handleLogin)}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-slideIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className={`space-y-4 transition-all duration-300 ease-in-out ${isSignUp ? 'animate-expandIn' : 'animate-expandOut h-0 overflow-hidden'}`}>
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D3CABE] focus:border-[#D3CABE] focus:z-10 transition-all duration-300 ease-in-out hover:border-[#D3CABE]"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D3CABE] focus:border-[#D3CABE] focus:z-10 transition-all duration-300 ease-in-out hover:border-[#D3CABE]"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D3CABE] focus:border-[#D3CABE] focus:z-10 transition-all duration-300 ease-in-out hover:border-[#D3CABE]"
                    placeholder="(XXX) XXX-XXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="buyer"
                        checked={formData.role === 'buyer'}
                        onChange={handleInputChange}
                        className="form-radio h-4 w-4 text-[#D3CABE] focus:ring-[#D3CABE] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Buyer</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="seller"
                        checked={formData.role === 'seller'}
                        onChange={handleInputChange}
                        className="form-radio h-4 w-4 text-[#D3CABE] focus:ring-[#D3CABE] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Seller</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D3CABE] focus:border-[#D3CABE] focus:z-10 transition-all duration-300 ease-in-out hover:border-[#D3CABE]"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D3CABE] focus:border-[#D3CABE] focus:z-10 transition-all duration-300 ease-in-out hover:border-[#D3CABE]"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {isSignUp && formData.password && (
                <div className="mt-3 animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                          passwordStrength.score === 0 ? 'bg-red-500 w-0' :
                          passwordStrength.score === 1 ? 'bg-red-500 w-1/5' :
                          passwordStrength.score === 2 ? 'bg-yellow-500 w-2/5' :
                          passwordStrength.score === 3 ? 'bg-blue-500 w-3/5' :
                          passwordStrength.score === 4 ? 'bg-green-500 w-4/5' :
                          'bg-green-600 w-full'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{passwordStrength.message}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-4">
            {!isSignUp && !isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="font-semibold text-[#8B7355] hover:text-[#6B563D] transition-all duration-300 ease-in-out transform hover:scale-105 text-base"
              >
                Forgot your password?
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setIsSignUp(!isSignUp);
                setResetEmailSent(false);
                setError(null);
              }}
              className="font-semibold text-[#8B7355] hover:text-[#6B563D] transition-all duration-300 ease-in-out transform hover:scale-105 text-base"
            >
              {isForgotPassword ? 'Back to login' : 
                (isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up")}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-[#8B7355] hover:bg-[#6B563D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B7355] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] shadow-md"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading 
              ? (isForgotPassword ? 'Sending reset link...' : 
                  (isSignUp ? 'Creating account...' : 'Signing in...'))
              : (isForgotPassword ? 'Send Reset Link' : 
                  (isSignUp ? 'Create account' : 'Sign in'))}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 