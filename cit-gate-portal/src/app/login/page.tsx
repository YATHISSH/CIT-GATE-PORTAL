"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // This will be DOB for students
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState(""); // DOB error for students
  const [role, setRole] = useState<'student' | 'teacher'>('student'); // Default to student
  const [showPassword, setShowPassword] = useState(false); // For teacher password visibility

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
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Add slashes automatically
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5);
    }
    
    // Limit to 10 characters (DD/MM/YYYY)
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
      // Student Login Logic
      if (!validateEmail(email)) {
        setIsLoading(false);
        return;
      }
      if (!validatePassword(password)) { // password is DOB for student
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
        router.push("/student"); // Redirect to student dashboard
      } catch (err) {
        console.error('Student login error:', err);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Teacher Login Logic (to be implemented more thoroughly)
      // For now, a basic structure, assuming direct email/password for teachers
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
        router.push("/teacher"); // Redirect to teacher dashboard
      } catch (err) {
        console.error('Teacher login error:', err);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const hasErrors = emailError !== "" || passwordError !== "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {role === 'student' ? 'Student Login' : 'Teacher Login'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {role === 'student' ? 'Use your college email and date of birth (DD/MM/YYYY)' : 'Use your provided credentials'}
          </p>
          <div className="flex justify-center space-x-4 my-4">
            <button 
              onClick={() => setRole('student')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${role === 'student' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              Student
            </button>
            <button 
              onClick={() => setRole('teacher')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${role === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              Teacher
            </button>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                College Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="yourname@citchennai.net"
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Password (Date of Birth) */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {role === 'student' ? 'Password (Date of Birth)' : 'Password'}
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={role === 'student' ? "text" : (showPassword ? "text" : "password")}
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder={role === 'student' ? "DD/MM/YYYY" : "Enter your password"}
                value={password}
                onChange={role === 'student' ? handlePasswordChange : (e) => setPassword(e.target.value)}
                maxLength={role === 'student' ? 10 : undefined}
                />
                {role === 'teacher' && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
              {passwordError && role === 'student' && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
              {role === 'student' && <p className="mt-1 text-xs text-gray-500">Enter your date of birth as registered</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || hasErrors}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Create one here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}