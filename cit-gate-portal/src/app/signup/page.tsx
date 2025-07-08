// signup.tsx
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
    "Computer Science and Engineering",
    "Information Technology",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Aeronautical Engineering",
    "Automobile Engineering"
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
    
    // Check if it's a valid date
    const [day, month, year] = dob.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      setDobError("Please enter a valid date");
      return false;
    }
    
    // Check if person is at least 16 years old
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
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Add slashes automatically
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Student Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register with your college details
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="regno" className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <input
                id="regno"
                name="regno"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your registration number"
                value={regno}
                onChange={(e) => setRegno(e.target.value.toUpperCase())}
              />
            </div>

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

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                Date of Birth (Password)
              </label>
              <input
                id="dob"
                name="dob"
                type="text"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  dobError ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="DD/MM/YYYY"
                value={dob}
                onChange={handleDOBChange}
                maxLength={10}
              />
              {dobError && (
                <p className="mt-1 text-sm text-red-600">{dobError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">This will be used as your password</p>
            </div>

            <div>
              <label htmlFor="dept" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="dept"
                name="dept"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              >
                <option value="">Select your department</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || hasErrors}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>   
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}