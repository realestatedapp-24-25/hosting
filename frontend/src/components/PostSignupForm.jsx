import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";

const PostSignupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = location.state?.role;
  const userEmail = location.state?.email;

  const [formData, setFormData] = useState(
    userRole === "institute"
      ? {
          institute_name: "",
          institute_type: "",
          description: "",
          geolocation: {
            type: "Point",
            coordinates: [0, 0],
          },
        }
      : {
          shopName: "",
          location: {
            type: "Point",
            coordinates: [0, 0],
          },
          contactInfo: {
            phone: "",
            email: userEmail || "",
          },
        }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          if (userRole === "institute") {
            setFormData((prev) => ({
              ...prev,
              geolocation: {
                type: "Point",
                coordinates,
              },
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              location: {
                type: "Point",
                coordinates,
              },
            }));
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Failed to get location. Please try again.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = userRole === "institute" 
        ? "/api/v1/institutes/create"
        : "/api/v1/shops";

      // Get the token from cookies
      const response = await axios.post(endpoint, formData, {
        headers: { 
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      if (response.data.status === 'success') {
        navigate("/");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-center text-mycol-brunswick_green mb-6">
          {userRole === "institute" ? "Institute Details" : "Shop Details"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {userRole === "institute" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Institute Name
                </label>
                <input
                  type="text"
                  name="institute_name"
                  value={formData.institute_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-mycol-mint focus:outline-none focus:ring-mycol-mint"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Institute Type
                </label>
                <select
                  name="institute_type"
                  value={formData.institute_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-mycol-mint focus:outline-none focus:ring-mycol-mint"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="ORPHANAGE">Orphanage</option>
                  <option value="ELDERLY_HOME">Elderly Home</option>
                  <option value="FOOD_PROVIDER">Food Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-mycol-mint focus:outline-none focus:ring-mycol-mint"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shop Name
                </label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-mycol-mint focus:outline-none focus:ring-mycol-mint"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={formData.contactInfo?.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-mycol-mint focus:outline-none focus:ring-mycol-mint"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo?.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-mycol-mint focus:outline-none focus:ring-mycol-mint bg-gray-100"
                  required
                  readOnly
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email auto-filled from your account
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleLocation}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-mycol-mint hover:bg-mycol-mint-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mycol-mint"
              >
                <FiMapPin className="mr-2" />
                Get My Location
              </button>
              {(userRole === "institute" ? formData.geolocation : formData.location).coordinates[0] !== 0 && (
                <span className="text-sm text-green-600">Location captured!</span>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mycol-mint hover:bg-mycol-mint-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mycol-mint disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostSignupForm; 