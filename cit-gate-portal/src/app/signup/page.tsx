"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [regno, setRegno] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [dept, setDept] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [dobError, setDobError] = useState("");
  
  const router = useRouter();

  const departments = [
  "CSE - Computer Science and Engineering",
  "IT - Information Technology",
  "ECE - Electronics and Communication Engineering",
  "EEE - Electrical and Electronics Engineering",
  "MECH - Mechanical Engineering",
  "CIVIL - Civil Engineering",
  "BME - Biomedical Engineering",
  "MCT - Mechatronics Engineering",
  "AIML - Computer Science and Engineering (AI & ML)",
  "CS - Computer Science and Engineering (Cyber Security)",
  "AIDS - Artificial Intelligence and Data Science",
  "CSBS - Computer Science and Business Systems",
  "ECE-ACT - Electronics and Communication Engineering (Advanced Communication Technology)",
  "VLSI - Electronics Engineering (VLSI Design & Technology)"
];



  const validateEmail = (email: string) => {
    if (!email.endsWith("@citchennai.net")) {
      setEmailError("Email must be your college email ending with @citchennai.net");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateDOB = (dob: string) => {
    const dobPattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dobPattern.test(dob)) {
      setDobError("Date of birth must be in DD/MM/YYYY format");
      return false;
    }
    
    const [day, month, year] = dob.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      setDobError("Please enter a valid date");
      return false;
    }
    
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 16 || (age === 16 && monthDiff < 0) || (age === 16 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      setDobError("You must be at least 16 years old");
      return false;
    }
    
    setDobError("");
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

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setDob(value);
    if (value.length === 10) {
      validateDOB(value);
    } else {
      setDobError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    if (!name.trim()) {
      setError("Name is required");
      setIsLoading(false);
      return;
    }
    
    if (!regno.trim()) {
      setError("Registration number is required");
      setIsLoading(false);
      return;
    }
    
    if (!validateEmail(email)) {
      setIsLoading(false);
      return;
    }
    
    if (!validateDOB(dob)) {
      setIsLoading(false);
      return;
    }
    
    if (!dept) {
      setError("Please select your department");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/student/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          regno: regno.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          dob,
          dept,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'An error occurred during signup.');
        setIsLoading(false);
        return;
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred while creating your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = emailError !== "" || dobError !== "";

  return (
    <>
      <style jsx>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  
  .signup-container {
    min-height: 100vh;
    background: #0f172a;
    background-image: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(34, 197, 94, 0.3), rgba(15, 23, 42, 0));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 1rem; /* Reduced from 2rem */
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
    overflow: hidden;
  }

  .animated-background {
    position: absolute;
    inset: 0; /* Shorthand for top/left/right/bottom: 0 */
    background: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(34, 197, 94, 0.3), rgba(15, 23, 42, 0));
    animation: pulse-bg 4s ease-in-out infinite;
  }

  @keyframes pulse-bg {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .signup-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 520px; /* Reduced from 600px */
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 18px; /* Reduced from 24px */
    box-shadow: 
      0 18px 35px -12px rgba(0, 0, 0, 0.4), /* Reduced shadow */
      0 0 0 1px rgba(148, 163, 184, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    padding: 2.25rem; /* Reduced from 3rem */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .signup-card:hover {
    transform: translateY(-5px); /* Reduced from -8px */
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5), /* Reduced shadow */
      0 0 0 1px rgba(148, 163, 184, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .logo-container {
    width: 60px; /* Reduced from 80px */
    height: 60px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-radius: 15px; /* Reduced from 20px */
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem auto; /* Reduced from 2rem */
    box-shadow: 0 12px 25px rgba(34, 197, 94, 0.3); /* Reduced shadow */
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
    width: 30px; /* Reduced from 40px */
    height: 30px;
    color: white;
    position: relative;
    z-index: 2;
  }

  .title {
    font-size: 2rem; /* Reduced from 2.5rem */
    font-weight: 800;
    color: white;
    text-align: center;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .subtitle {
    font-size: 0.9375rem; /* Reduced from 1.125rem */
    color: #cbd5e1;
    text-align: center;
    margin-bottom: 1.25rem; /* Reduced from 2rem */
    font-weight: 500;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.125rem; /* Reduced from 1.5rem */
    margin-bottom: 1.5rem; /* Reduced from 2rem */
  }

  .form-grid-two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.125rem; /* Reduced from 1.5rem */
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-label {
    font-size: 0.8rem; /* Reduced from 0.875rem */
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 5px; /* Reduced from 8px */
    text-transform: uppercase;
    letter-spacing: 0.3px; /* Reduced from 0.5px */
  }

  .input-container {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 12px; /* Reduced from 16px */
    top: 50%;
    transform: translateY(-50%);
    width: 16px; /* Reduced from 20px */
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
    border-radius: 9px; /* Reduced from 12px */
    color: white;
    font-size: 0.9rem; /* Reduced from 1rem */
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  }

  .form-select {
    width: 100%;
    padding: 12px 12px 12px 40px; /* Reduced padding */
    background: rgba(51, 65, 85, 0.5);
    border: 2px solid #475569;
    border-radius: 9px; /* Reduced from 12px */
    color: white;
    font-size: 0.9rem; /* Reduced from 1rem */
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    appearance: none;
    cursor: pointer;
  }

  .form-select option {
    background: #334155;
    color: white;
    padding: 10px; /* Reduced from 12px */
  }

  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3); /* Reduced from 4px */
    background: rgba(51, 65, 85, 0.8);
  }

  .form-input:focus + .input-icon,
  .form-select:focus + .input-icon {
    color: #22c55e;
  }

  .form-input.error,
  .form-select.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); /* Reduced from 4px */
  }

  .form-input::placeholder {
    color: #64748b;
    font-weight: 400;
  }

  .select-arrow {
    position: absolute;
    right: 12px; /* Reduced from 16px */
    top: 50%;
    transform: translateY(-50%);
    width: 16px; /* Reduced from 20px */
    height: 16px;
    color: #64748b;
    pointer-events: none;
    transition: color 0.3s ease;
  }

  .error-message {
    display: flex;
    align-items: center;
    margin-top: 5px; /* Reduced from 8px */
    color: #fca5a5;
    font-size: 0.8rem; /* Reduced from 0.875rem */
    font-weight: 500;
  }

  .error-icon {
    width: 12px; /* Reduced from 16px */
    height: 12px;
    margin-right: 4px; /* Reduced from 6px */
  }

  .help-text {
    margin-top: 4px; /* Reduced from 6px */
    color: #94a3b8;
    font-size: 0.6875rem; /* Reduced from 0.75rem */
    font-weight: 400;
  }

  .submit-button {
    width: 100%;
    padding: 12px; /* Reduced from 16px */
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border: none;
    border-radius: 9px; /* Reduced from 12px */
    color: white;
    font-size: 0.9rem; /* Reduced from 1rem */
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 6px 18px rgba(34, 197, 94, 0.3); /* Reduced shadow */
    position: relative;
    overflow: hidden;
    margin-top: 0.75rem; /* Reduced from 1rem */
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3); /* Reduced shadow */
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
    gap: 5px; /* Reduced from 8px */
  }

  .loading-spinner {
    width: 16px; /* Reduced from 20px */
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
    padding-top: 1.25rem; /* Reduced from 2rem */
    border-top: 1px solid #475569;
    margin-top: 1.25rem; /* Reduced from 2rem */
  }

  .footer-text {
    color: #94a3b8;
    font-size: 0.8rem; /* Reduced from 0.875rem */
    font-weight: 400;
  }

  .footer-link {
    color: #22c55e;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;
  }

  .footer-link:hover {
    color: #16a34a;
    text-decoration: underline;
  }

  .error-alert {
    background: rgba(127, 29, 29, 0.5);
    border: 1px solid #dc2626;
    color: #fca5a5;
    padding: 12px; /* Reduced from 16px */
    border-radius: 9px; /* Reduced from 12px */
    margin-bottom: 1.125rem; /* Reduced from 1.5rem */
    backdrop-filter: blur(10px);
  }

  .success-alert {
    background: rgba(20, 83, 45, 0.5);
    border: 1px solid #22c55e;
    color: #86efac;
    padding: 12px; /* Reduced from 16px */
    border-radius: 9px; /* Reduced from 12px */
    margin-bottom: 1.125rem; /* Reduced from 1.5rem */
    backdrop-filter: blur(10px);
  }

  .alert-content {
    display: flex;
    align-items: center;
    gap: 8px; /* Reduced from 12px */
  }

  .alert-icon {
    width: 16px; /* Reduced from 20px */
    height: 16px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .signup-container {
      padding: 1rem 0.75rem; /* Further reduced for mobile */
    }
    
    .signup-card {
      max-width: 100%;
      margin: 0.75rem; /* Reduced from 1rem */
      padding: 1.75rem; /* Reduced from 2rem */
    }
    
    .title {
      font-size: 1.75rem; /* Reduced from 2rem */
    }
    
    .logo-container {
      width: 50px; /* Reduced from 64px */
      height: 50px;
      margin-bottom: 1rem;
    }
    
    .logo-icon {
      width: 26px; /* Reduced from 32px */
      height: 26px;
    }

    .form-grid-two {
      grid-template-columns: 1fr;
    }

    .form-input,
    .form-select {
      padding: 10px 10px 10px 36px; /* Further reduced for mobile */
      font-size: 0.8125rem;
    }

    .input-icon {
      width: 14px;
      height: 14px;
      left: 10px;
    }
  }

  @media (max-width: 640px) {
    .form-grid,
    .form-grid-two {
      grid-template-columns: 1fr;
      gap: 0.875rem; /* Reduced from 1rem */
    }
    
    .signup-card {
      padding: 1.5rem;
      margin: 0.5rem;
    }
  }

  /* Additional mobile optimization */
  @media (max-width: 480px) {
    .signup-card {
      padding: 1.25rem;
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
    .signup-container {
      padding: 0.5rem 0.25rem;
    }
    
    .signup-card {
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


      <div className="signup-container">
        <div className="animated-background"></div>
        
        <div className="signup-card">
          {/* Header Section */}
          <div>
            {/* Logo/Icon */}
            <div className="logo-container">
              <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            
            <h1 className="title">
              Create Student Account
            </h1>
            <p className="subtitle">
              Sign up to unlock your dashboard
            </p>
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

            {/* Success Display */}
            {success && (
              <div className="success-alert">
                <div className="alert-content">
                  <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="form-grid">
              {/* Name and Registration Number */}
              <div className="form-grid-two">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <div className="input-container">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="form-input"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="regno" className="form-label">
                    Registration Number
                  </label>
                  <div className="input-container">
                    <input
                      id="regno"
                      name="regno"
                      type="text"
                      required
                      className="form-input"
                      placeholder="Enter reg number"
                      value={regno}
                      onChange={(e) => setRegno(e.target.value.toUpperCase())}
                    />
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email */}
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

              {/* Date of Birth and Department */}
              <div className="form-grid-two">
                <div className="form-group">
                  <label htmlFor="dob" className="form-label">
                    Date of Birth
                  </label>
                  <div className="input-container">
                    <input
                      id="dob"
                      name="dob"
                      type="text"
                      required
                      className={`form-input ${dobError ? 'error' : ''}`}
                      placeholder="DD/MM/YYYY"
                      value={dob}
                      onChange={handleDOBChange}
                      maxLength={10}
                    />
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2z" />
                    </svg>
                  </div>
                  {dobError && (
                    <div className="error-message">
                      <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {dobError}
                    </div>
                  )}
                  <div className="help-text">
                    This will be used as your login password
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="dept" className="form-label">
                    Department
                  </label>
                  <div className="input-container">
                    <select
  id="dept"
  name="dept"
  required
  className="form-select"
  value={dept}
  onChange={(e) => setDept(e.target.value)}
>
  <option value="" disabled>
    Select your department
  </option>
  {departments.map((department) => (
    <option key={department.split(' - ')[0]} value={department}>
      {department}
    </option>
  ))}
</select>
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <svg className="select-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="button-content">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Create Student Account</span>
                </div>
              )}
            </button>

            {/* Footer */}
            <div className="footer">
              <p className="footer-text">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="footer-link"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
