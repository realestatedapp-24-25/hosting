import React, { useContext, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiUser, FiMail, FiMapPin, FiShield, FiEdit, FiCheck, FiHome, FiMap, FiX, FiLoader, FiCamera } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    ...user,
    address: user.address || {},
  });
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user, address: user.address || {} });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user, address: user.address || {} });
    setPhotoPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setEditedUser((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setEditedUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("photo", file);

      const response = await axios.patch("/api/v1/users/updateme", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data.data.user);
      setPhotoPreview(null);
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload photo");
      setPhotoPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!editedUser.name || !editedUser.email) {
      toast.error("Name and email are required");
      return false;
    }
    if (editedUser.email && !/\S+@\S+\.\S+/.test(editedUser.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.patch(
        "/api/v1/users/updateme",
        {
          name: editedUser.name,
          email: editedUser.email,
          address: editedUser.address,
        },
        {
          withCredentials: true,
        }
      );

      setUser(response.data.data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <FiLoader className="h-8 w-8 animate-spin text-mycol-mint" />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-mycol-brunswick_green mb-2">
            Profile Details
          </h1>
          <p className="text-gray-600">
            Manage your account information and settings
          </p>
        </div>
        <div className="flex space-x-4">
          {isEditing ? (
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <FiX className="h-5 w-5" />
              <span>Cancel</span>
            </button>
          ) : null}
          <button
            onClick={isEditing ? handleSave : handleEdit}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isEditing
                ? "bg-mycol-sea_green text-white hover:bg-mycol-brunswick_green"
                : "bg-mycol-mint text-white hover:bg-mycol-sea_green"
            }`}
          >
            {loading ? (
              <FiLoader className="h-5 w-5 animate-spin" />
            ) : isEditing ? (
              <FiCheck className="h-5 w-5" />
            ) : (
              <FiEdit className="h-5 w-5" />
            )}
            <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Profile Photo */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-mycol-brunswick_green mb-4">
              Profile Photo
            </h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-mycol-celadon shadow-md">
                  <img
                    src={photoPreview || user?.photo || "https://via.placeholder.com/100"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-mycol-mint text-white rounded-full shadow-lg hover:bg-mycol-sea_green transition-colors"
                    >
                      <FiCamera className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a profile photo to personalize your account.
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG • Max size: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-mycol-brunswick_green mb-4">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedUser.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint"
                  />
                ) : (
                  <div className="flex items-center">
                    <FiUser className="text-mycol-sea_green mr-2" />
                    <span>{user.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint"
                  />
                ) : (
                  <div className="flex items-center">
                    <FiMail className="text-mycol-sea_green mr-2" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="flex items-center">
                  <FiShield className="text-mycol-sea_green mr-2" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-mycol-brunswick_green mb-4">
              Address Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.street"
                    value={editedUser.address?.street || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint"
                  />
                ) : (
                  <div className="flex items-center">
                    <FiHome className="text-mycol-sea_green mr-2" />
                    <span>{user.address?.street || "Not specified"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.city"
                    value={editedUser.address?.city || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint"
                  />
                ) : (
                  <div className="flex items-center">
                    <FiMapPin className="text-mycol-sea_green mr-2" />
                    <span>{user.address?.city || "Not specified"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.state"
                    value={editedUser.address?.state || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint"
                  />
                ) : (
                  <div className="flex items-center">
                    <FiMap className="text-mycol-sea_green mr-2" />
                    <span>{user.address?.state || "Not specified"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.pincode"
                    value={editedUser.address?.pincode || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint"
                  />
                ) : (
                  <div className="flex items-center">
                    <FiMapPin className="text-mycol-sea_green mr-2" />
                    <span>{user.address?.pincode || "Not specified"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-mycol-brunswick_green mb-4">
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Account Type</span>
                <span className="px-3 py-1 bg-mycol-nyanza text-mycol-sea_green rounded-full capitalize font-medium">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Member Since</span>
                <span className="text-gray-800 font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {user.role === "donor" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-mycol-brunswick_green mb-4">
                Donation Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Donations</span>
                  <span className="text-mycol-brunswick_green font-medium">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Last Donation</span>
                  <span className="text-gray-800 font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 