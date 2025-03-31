import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdEmail, MdLock } from "react-icons/md";

const SigninPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        "/api/v1/users/login", // Ensure this matches your backend route
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        setShowSuccessAlert(true);
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 p-5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-mycol-brunswick_green mb-3">
            Welcome Back to hi
          </h1>
          <p className="text-mycol-sea_green text-lg max-w-2xl mx-auto">
            Access your dashboard and manage your activities
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
            <div className="lg:col-span-3 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdEmail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-lg font-medium bg-white border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent transition-all duration-300"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-lg font-medium bg-white border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:border-transparent transition-all duration-300"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-mycol-mint hover:bg-mycol-mint-2 focus:outline-none focus:ring-2 focus:ring-mycol-mint focus:ring-offset-2 shadow-lg transform transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-mycol-mint hover:text-mycol-mint-2"
                  >
                    Sign up
                  </Link>
                </p>
              </form>

              {showSuccessAlert && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center animate-fade-in">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Login successful! Redirecting...</span>
                </div>
              )}

              {loginError && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center animate-fade-in">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Invalid credentials. Please try again.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-mycol-sea_green">
            By signing in, you agree to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
