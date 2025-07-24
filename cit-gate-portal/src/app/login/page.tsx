"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const validateEmail = (email: string) => {
    if (!email.endsWith("@citchennai.net")) {
      setEmailError("Email must be your college email ending with @citchennai.net");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    const dobPattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dobPattern.test(password)) {
      setPasswordError("Password must be in DD/MM/YYYY format");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      validateEmail(newEmail);
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5);
    }
    
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    setPassword(value);
    if (value.length === 10) {
      validatePassword(value);
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (role === 'student') {
      if (!validateEmail(email)) {
        setIsLoading(false);
        return;
      }
      if (!validatePassword(password)) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase(), dob: password }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Student login failed.');
          setIsLoading(false);
          return;
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        router.push("/student");
      } catch (err) {
        console.error('Student login error:', err);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const response = await fetch('/api/auth/teacher/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase(), password }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Teacher login failed.');
          setIsLoading(false);
          return;
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        router.push("/teacher");
      } catch (err) {
        console.error('Teacher login error:', err);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const hasErrors = emailError !== "" || passwordError !== "";

  // Dynamic theme colors based on role
  const themeColors = role === 'student' 
    ? {
        primary: '#22c55e',
        primaryHover: '#16a34a',
        primaryLight: '#dcfce7',
        accent: '#4ade80',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        spotlight: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(34, 197, 94, 0.3), rgba(15, 23, 42, 0))',
        shadow: 'rgba(34, 197, 94, 0.3)'
      }
    : {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryLight: '#dbeafe',
        accent: '#60a5fa',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        spotlight: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59, 130, 246, 0.3), rgba(15, 23, 42, 0))',
        shadow: 'rgba(59, 130, 246, 0.3)'
      };

  return (
    <>
      <style jsx>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  
  .login-container {
    min-height: 100vh;
    background: #0f172a;
    background-image: ${themeColors.spotlight};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 1rem; /* Further reduced from 2rem */
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
    overflow: hidden;
  }

  .animated-background {
    position: absolute;
    inset: 0;
    background: ${themeColors.spotlight};
    animation: pulse-bg 4s ease-in-out infinite;
  }

  @keyframes pulse-bg {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .login-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px; /* Further reduced from 450px */
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 18px; /* Reduced from 20px */
    box-shadow: 
      0 18px 35px -12px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(148, 163, 184, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    padding: 2.25rem; /* Reduced from 2.5rem */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .login-card:hover {
    transform: translateY(-5px); /* Reduced from -6px */
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(148, 163, 184, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .logo-container {
    width: 60px; /* Further reduced from 70px */
    height: 60px;
    background: ${themeColors.gradient};
    border-radius: 15px; /* Reduced from 18px */
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem auto; /* Reduced from 1.5rem */
    box-shadow: 0 12px 25px ${themeColors.shadow};
    position: relative;
    overflow: hidden;
  }

  .logo-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: rotate(45deg);
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }

  .logo-icon {
    width: 30px; /* Further reduced from 36px */
    height: 30px;
    color: white;
    position: relative;
    z-index: 2;
  }

  .title {
  font-size: 2rem; /* Reduced from 2.25rem */
  font-weight: 800;
  color: white;
  text-align: center;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3); /* Reduced shadow */
  transition: all 0.3s ease;
}

.title:hover {
  transform: translateY(-1px);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.subtitle {
  font-size: 0.9375rem; /* Reduced from 1rem */
  color: #cbd5e1;
  text-align: center;
  margin-bottom: 1.25rem; /* Reduced from 1.5rem */
  font-weight: 500;
  transition: color 0.3s ease;
}

.subtitle:hover {
  color: #e2e8f0;
}

.role-toggle {
  display: flex;
  justify-content: center;
  gap: 4px; /* Reduced from 5px */
  margin: 1.25rem 0; /* Reduced from 1.5rem */
  padding: 3px; /* Reduced from 4px */
  background: rgba(51, 65, 85, 0.6);
  border-radius: 12px; /* Reduced from 14px */
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); /* Added subtle shadow */
}

.role-toggle:hover {
  background: rgba(51, 65, 85, 0.7);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.role-button {
  padding: 9px 16px; /* Corrected from 100px - that was too wide */
  border-radius: 9px; /* Reduced from 10px */
  font-size: 0.8rem; /* Reduced from 0.8125rem */
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-width: 80px; /* Added minimum width for consistency */
  flex: 1; /* Equal width distribution */
}

.role-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.role-button:hover::before {
  left: 100%;
}

.role-button.active {
  background: ${themeColors.gradient};
  color: white;
  box-shadow: 0 4px 15px ${themeColors.shadow}; /* Reduced shadow */
  transform: translateY(-1px); /* Reduced from -2px */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.role-button.active::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: exclude;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

.role-button.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px ${themeColors.shadow};
}

.role-button.inactive {
  background: transparent;
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.role-button.inactive:hover {
  background: rgba(51, 65, 85, 0.8);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border-color: rgba(148, 163, 184, 0.4);
}

.role-button.inactive:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

  .form-group {
    margin-bottom: 1.125rem; /* Reduced from 1.25rem */
  }

  .form-label {
    display: block;
    font-size: 0.8rem; /* Reduced from 0.8125rem */
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 5px; /* Reduced from 6px */
    text-transform: uppercase;
    letter-spacing: 0.3px; /* Reduced from 0.4px */
  }

  .input-container {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 12px; /* Reduced from 14px */
    top: 50%;
    transform: translateY(-50%);
    width: 16px; /* Further reduced from 18px */
    height: 16px;
    color: #64748b;
    pointer-events: none;
    transition: color 0.3s ease;
  }

  .form-input {
    width: 100%;
    padding: 12px 12px 12px 40px; /* Reduced padding */
    background: rgba(51, 65, 85, 0.5);
    border: 2px solid #475569;
    border-radius: 9px; /* Reduced from 10px */
    color: white;
    font-size: 0.9rem; /* Reduced from 0.9375rem */
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  }

  .form-input:focus {
    outline: none;
    border-color: ${themeColors.primary};
    box-shadow: 0 0 0 3px ${themeColors.shadow};
    background: rgba(51, 65, 85, 0.8);
  }

  .form-input:focus + .input-icon {
    color: ${themeColors.primary};
  }

  .form-input.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  }

  .form-input::placeholder {
    color: #64748b;
    font-weight: 400;
  }

  .password-toggle {
    position: absolute;
    right: 12px; /* Reduced from 14px */
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 2px; /* Reduced from 3px */
    border-radius: 4px; /* Reduced from 5px */
    transition: all 0.3s ease;
  }

  .password-toggle:hover {
    color: ${themeColors.primary};
    background: rgba(51, 65, 85, 0.5);
  }

  .error-message {
    display: flex;
    align-items: center;
    margin-top: 5px; /* Reduced from 6px */
    color: #fca5a5;
    font-size: 0.8rem; /* Reduced from 0.8125rem */
    font-weight: 500;
  }

  .error-icon {
    width: 12px; /* Further reduced from 14px */
    height: 12px;
    margin-right: 4px; /* Reduced from 5px */
  }

  .help-text {
    margin-top: 4px; /* Reduced from 5px */
    color: #94a3b8;
    font-size: 0.6875rem;
    font-weight: 400;
  }

  .submit-button {
    width: 100%;
    padding: 12px; /* Reduced from 14px */
    background: ${themeColors.gradient};
    border: none;
    border-radius: 9px; /* Reduced from 10px */
    color: white;
    font-size: 0.9rem; /* Reduced from 0.9375rem */
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 6px 18px ${themeColors.shadow}; /* Reduced shadow */
    position: relative;
    overflow: hidden;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px ${themeColors.shadow}; /* Reduced shadow */
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-button:disabled {
    background: #475569;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.7;
  }

  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px; /* Reduced from 6px */
  }

  .loading-spinner {
    width: 16px; /* Reduced from 18px */
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .footer {
    text-align: center;
    padding-top: 1.25rem; /* Reduced from 1.5rem */
    border-top: 1px solid #475569;
    margin-top: 1.25rem; /* Reduced from 1.5rem */
  }

  .footer-text {
    color: #94a3b8;
    font-size: 0.8rem; /* Reduced from 0.8125rem */
    font-weight: 400;
  }

  .footer-link {
    color: ${themeColors.primary};
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;
  }

  .footer-link:hover {
    color: ${themeColors.primaryHover};
    text-decoration: underline;
  }

  .error-alert {
    background: rgba(127, 29, 29, 0.5);
    border: 1px solid #dc2626;
    color: #fca5a5;
    padding: 12px; /* Reduced from 14px */
    border-radius: 9px; /* Reduced from 10px */
    margin-bottom: 1.125rem; /* Reduced from 1.25rem */
    backdrop-filter: blur(10px);
  }

  .alert-content {
    display: flex;
    align-items: center;
    gap: 8px; /* Reduced from 10px */
  }

  .alert-icon {
    width: 16px; /* Reduced from 18px */
    height: 16px;
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .login-container {
      padding: 0.75rem 0.5rem; /* Further reduced for mobile */
    }
    
    .login-card {
      max-width: 100%;
      margin: 0.5rem; /* Reduced from 0.75rem */
      padding: 1.5rem; /* Reduced from 1.75rem */
    }
    
    .title {
      font-size: 1.75rem; /* Reduced from 1.875rem */
    }
    
    .logo-container {
      width: 50px; /* Further reduced from 60px */
      height: 50px;
      margin-bottom: 1rem;
    }
    
    .logo-icon {
      width: 26px; /* Reduced from 30px */
      height: 26px;
    }
    
    .form-input {
      padding: 10px 10px 10px 36px; /* Further reduced for mobile */
      font-size: 0.8125rem;
    }
    
    .submit-button {
      padding: 10px;
      font-size: 0.8125rem;
    }

    .input-icon {
      width: 14px;
      height: 14px;
      left: 10px;
    }
  }

  /* Additional mobile optimization */
  @media (max-width: 480px) {
    .login-card {
      padding: 1.25rem; /* Reduced from 1.5rem */
      margin: 0.25rem;
    }
    
    .title {
      font-size: 1.625rem;
    }
    
    .subtitle {
      font-size: 0.875rem;
    }

    .logo-container {
      width: 45px;
      height: 45px;
    }
    
    .logo-icon {
      width: 24px;
      height: 24px;
    }
  }

  /* Ultra-compact mode for very small screens */
  @media (max-width: 360px) {
    .login-container {
      padding: 0.5rem 0.25rem;
    }
    
    .login-card {
      padding: 1rem;
      margin: 0.125rem;
    }
    
    .logo-container {
      width: 40px;
      height: 40px;
    }
    
    .logo-icon {
      width: 22px;
      height: 22px;
    }
  }
`}</style>

      <div className="login-container">
        <div className="animated-background"></div>
        
        <div className="login-card">
          {/* Header Section */}
          <div>
            {/* Logo/Icon */}
            <div className="logo-container">
              <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h1 className="title">
              {role === 'student' ? 'Student Portal' : 'Faculty Portal'}
            </h1>
            <p className="subtitle">
              {role === 'student' ? ' Login →  Attempt →  Achieve' : 'Create, monitor, and evaluate assessments '}
            </p>
            
            {/* Role Toggle */}
            <div className="role-toggle">
              <button 
                onClick={() => setRole('student')}
                className={`role-button ${role === 'student' ? 'active' : 'inactive'}`}
              >
                Student
              </button>
              <button 
                onClick={() => setRole('teacher')}
                className={`role-button ${role === 'teacher' ? 'active' : 'inactive'}`}
              >
                Faculty
              </button>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit}>
            {/* Error Display */}
            {error && (
              <div className="error-alert">
                <div className="alert-content">
                  <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Institutional Email
              </label>
              <div className="input-container">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`form-input ${emailError ? 'error' : ''}`}
                  placeholder="yourname@citchennai.net"
                  value={email}
                  onChange={handleEmailChange}
                />
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              {emailError && (
                <div className="error-message">
                  <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {emailError}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {role === 'student' ? 'Date of Birth' : 'Access Code'}
              </label>
              <div className="input-container">
                <input
                  id="password"
                  name="password"
                  type={role === 'student' ? "text" : (showPassword ? "text" : "password")}
                  required
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  placeholder={role === 'student' ? "DD/MM/YYYY" : "Enter your access code"}
                  value={password}
                  onChange={role === 'student' ? handlePasswordChange : (e) => setPassword(e.target.value)}
                  maxLength={role === 'student' ? 10 : undefined}
                  style={{ paddingRight: role === 'teacher' ? '48px' : '16px' }}
                />
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={role === 'student' ? "M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2z" : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"} />
                </svg>
                {role === 'teacher' && (
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="password-toggle"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? (
      // Password is VISIBLE - show open eye icon
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ) : (
      // Password is HIDDEN - show closed/crossed eye icon (INITIAL STATE)
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    )}
  </button>
)}

             
              </div>
              {passwordError && role === 'student' && (
                <div className="error-message">
                  <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {passwordError}
                </div>
              )}
              {role === 'student' && (
                <div className="help-text">
                  Enter your registered date of birth (DD/MM/YYYY format)
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || hasErrors}
              className="submit-button"
            >
              {isLoading ? (
                <div className="button-content">
                  <div className="loading-spinner"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="button-content">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Access {role === 'student' ? 'Student' : 'Faculty'} Portal</span>
                </div>
              )}
            </button>

            {/* Footer */}
            <div className="footer">
              <p className="footer-text">
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="footer-link"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
