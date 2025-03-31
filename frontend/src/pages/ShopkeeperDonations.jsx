import React, { useState, useEffect } from "react";
import { CheckCircle, MapPin, Camera, Loader2 } from "lucide-react";
import axios from "axios";

const ShopkeeperDonations = () => {
  const [code, setCode] = useState("");
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Automatically get location when component mounts
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLocationError(null);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLocationError("Unable to fetch your location. Please enable location access.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleConfirm = async () => {
    if (!code || !location || !photo) {
      alert("Please enter the code and take a photo of the delivery.");
      return;
    }

    setIsLoading(true);

    try {
      // Create form data to send both photo and location
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);

      const response = await axios.post(
        `/api/v1/shipping/verify-delivery/${code}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setIsConfirmed(true);
        alert("Delivery confirmed successfully!");
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while confirming delivery."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <MapPin className="text-green-500" size={24} />
          Delivery Confirmation
        </h1>

        {/* Input Code */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Delivery Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your code"
          />
        </div>

        {/* Location Status */}
        <div className="mb-6">
          {locationError ? (
            <div className="p-4 bg-red-50 rounded-lg text-red-700 flex items-center gap-2">
              <MapPin size={18} />
              {locationError}
              <button
                onClick={getLocation}
                className="ml-auto text-sm underline hover:text-red-800"
              >
                Retry
              </button>
            </div>
          ) : location ? (
            <div className="p-4 bg-green-50 rounded-lg text-green-700 flex items-center gap-2">
              <MapPin size={18} />
              Location acquired
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-700 flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Getting your location...
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Photo
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Delivery preview"
                    className="mx-auto h-32 w-auto rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="photo-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                    >
                      <span>Take a photo</span>
                      <input
                        id="photo-upload"
                        name="photo-upload"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Take a clear photo of the delivered items</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={isLoading || !code || !location || !photo}
          className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Confirm Delivery
            </>
          )}
        </button>

        {/* Confirmation Message */}
        {isConfirmed && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-green-700 flex items-center gap-2">
            <CheckCircle className="text-green-700" size={18} />
            Delivery confirmed successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopkeeperDonations;