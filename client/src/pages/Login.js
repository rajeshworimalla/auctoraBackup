import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/animations.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    username: ''
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

  useEffect(() => {
    // Check for email confirmation in URL
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type=signup')) {
      setEmailConfirmed(true);
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

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
      const formattedNumber = formatPhoneNumber(value);
      if (formattedNumber.length <= 14) { // (XXX) XXX-XXXX = 14 chars
        setFormData(prev => ({
          ...prev,
          [name]: formattedNumber
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (isSignUp) {
      // Username validation
      if (!formData.username || formData.username.length < 3) {
        setError('Username must be at least 3 characters long');
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setError('Username can only contain letters, numbers, and underscores');
        return false;
      }

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
      console.log('=== STARTING SIGNUP PROCESS ===');
      console.log('Form data:', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        username: formData.username
      });

      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('User')
        .select('Username')
        .eq('Username', formData.username)
        .single();

      if (existingUser) {
        setError('This username is already taken. Please choose another one.');
        setLoading(false);
        return;
      }

      // Get the current URL origin
      const siteUrl = window.location.origin;
      console.log('Site URL:', siteUrl);

      // Sign up the user with Supabase Auth
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            username: formData.username,
          },
          emailRedirectTo: `${siteUrl}/login`
        }
      });

      console.log('=== AUTH RESPONSE ===');
      console.log('Auth data:', authData);
      console.log('Auth error:', authError);

      if (authError) {
        console.error('=== AUTH ERROR DETAILS ===');
        console.error('Message:', authError.message);
        console.error('Status:', authError.status);
        console.error('Name:', authError.name);
        
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(`Unable to create account: ${authError.message}`);
        }
        return;
      }

      if (!authData?.user?.id) {
        console.error('No user ID returned from auth signup');
        setError('Failed to create user account. Please try again.');
        return;
      }

      console.log('=== SIGNUP SUCCESSFUL ===');
      alert('Please check your email for a verification link. You must verify your email before you can sign in.');
      setIsSignUp(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        username: ''
      });
      setPasswordStrength({ score: 0, message: '' });
    } catch (error) {
      console.error('=== UNEXPECTED ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError(`Unable to create account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add this new function to handle email verification
  useEffect(() => {
    console.log('Setting up auth state change listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== AUTH STATE CHANGE ===');
      console.log('Event:', event);
      console.log('Session:', session);

      if (event === 'SIGNED_IN') {
        console.log('User signed in, checking email verification...');
        // Check if this is a new user who just verified their email
        if (session?.user?.email_confirmed_at) {
          console.log('Email confirmed, creating user record...');
          try {
            // Create the user record in public.users
            const { data: insertData, error: userError } = await supabase
              .from('users')
              .insert({
                User_Id: session.user.id,
                Email: session.user.email,
                Fname: session.user.user_metadata.first_name,
                Lname: session.user.user_metadata.last_name,
                Phone: session.user.user_metadata.phone,
                Username: session.user.user_metadata.username,
                Created_At: new Date().toISOString(),
                Updated_At: new Date().toISOString()
              })
              .select();

            console.log('=== USER RECORD CREATION ===');
            console.log('Insert data:', insertData);
            console.log('User error:', userError);

            if (userError) {
              console.error('Error creating user record:', userError);
            }
          } catch (error) {
            console.error('Error in email verification handler:', error);
          }
        }
      }
    });

    return () => {
      console.log('Cleaning up auth state change listener...');
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the current URL origin
      const siteUrl = window.location.origin;
      console.log('Site URL for password reset:', siteUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${siteUrl}/#/reset-password`,
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

        {emailConfirmed && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md animate-slideIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your email has been successfully verified! You can now sign in to your account.
                </p>
              </div>
            </div>
          </div>
        )}

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

        <form onSubmit={isSignUp ? handleSignUp : (isForgotPassword ? handleForgotPassword : handleLogin)} className="mt-8 space-y-6">
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
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D3CABE] focus:border-[#D3CABE] focus:z-10 transition-all duration-300 ease-in-out hover:border-[#D3CABE]"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Username can only contain letters, numbers, and underscores
                </p>
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
            </>
          )}

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
              
              {isSignUp && (
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

          <div className="flex flex-col items-center space-y-2 mt-4">
            {!isSignUp && !isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="font-semibold text-[#8B7355] hover:text-[#6B563D] transition-all duration-300 ease-in-out transform hover:scale-105 text-base text-center"
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
              className="font-semibold text-[#8B7355] hover:text-[#6B563D] transition-all duration-300 ease-in-out transform hover:scale-105 text-base text-center"
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