import React, { useContext, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Shield,
  Edit2,
  Check,
  Home,
  Building2,
  MapPinned,
  Camera,
  X,
  Loader2,
  Store,
  School,
  Heart,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const Profile = () => {
  const navigate = useNavigate();
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

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
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
    } finally {
      setLoading(false);
    }
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
          phone: editedUser.phone,
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

  // Enhanced role-specific styling
  const getRoleStyle = () => {
    switch (user.role) {
      case 'donor':
        return {
          gradient: 'from-emerald-600 to-teal-700',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          lightBg: 'bg-emerald-50',
          textColor: 'text-emerald-600'
        };
      case 'shopkeeper':
        return {
          gradient: 'from-amber-500 to-orange-600',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-500',
          lightBg: 'bg-amber-50',
          textColor: 'text-amber-600'
        };
      case 'institute':
        return {
          gradient: 'from-blue-500 to-indigo-600',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-500',
          lightBg: 'bg-blue-50',
          textColor: 'text-blue-600'
        };
      default:
        return {
          gradient: 'from-mycol-mint to-mycol-sea_green',
          iconBg: 'bg-mycol-nyanza',
          iconColor: 'text-mycol-sea_green',
          lightBg: 'bg-mycol-nyanza/30',
          textColor: 'text-mycol-sea_green'
        };
    }
  };

  const roleStyle = getRoleStyle();

  // Role-specific icons
  const getRoleIcon = () => {
    switch (user.role) {
      case 'donor':
        return <Heart className="h-6 w-6 text-emerald-600" />;
      case 'shopkeeper':
        return <Store className="h-6 w-6 text-amber-500" />;
      case 'institute':
        return <School className="h-6 w-6 text-blue-500" />;
      default:
        return <User className="h-6 w-6 text-mycol-sea_green" />;
    }
  };

  const handleQuickAction = () => {
    switch (user.role) {
      case 'donor':
        navigate('/profile/my-donations');
        break;
      case 'shopkeeper':
        navigate('/dashboard/inventory');
        break;
      case 'institute':
        navigate('/dashboard/requests');
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-mycol-mint rounded-full animate-spin border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 bg-mycol-mint rounded-full animate-ping"></div>
                </div>
              </div>
              <span className="text-gray-700 font-medium">Updating your profile...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header Section with Role-based Styling */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="relative mb-12 bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${roleStyle.gradient} opacity-10`}></div>
          <div className="relative p-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-800">
                  Welcome back, <span className={roleStyle.textColor}>{user.name}</span>!
                </h1>
                <p className="text-gray-600 text-lg flex items-center space-x-2">
                  <span>Manage your profile and preferences</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleStyle.lightBg} ${roleStyle.textColor}`}>
                    {getRoleIcon()}
                    <span className="ml-2">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                  </span>
                </p>
              </div>
              <div className="flex space-x-4">
                {isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300"
                    >
                      <X className="h-5 w-5" />
                      <span>Cancel</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r ${roleStyle.gradient} hover:shadow-lg transition-all duration-300`}
                    >
                      <Check className="h-5 w-5" />
                      <span>Save Changes</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEdit}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r ${roleStyle.gradient} hover:shadow-lg transition-all duration-300`}
                  >
                    <Edit2 className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="col-span-2 space-y-8">
            {/* Profile Card with Enhanced Design */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className={`h-24 bg-gradient-to-r ${roleStyle.gradient}`}></div>
              <div className="px-8 pb-8">
                <div className="relative -mt-12 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
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
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg bg-gradient-to-r ${roleStyle.gradient} text-white`}
                        >
                          <Camera className="h-5 w-5" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-gray-800 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                  )}

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editedUser.email}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className={roleStyle.iconColor} />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address Section with Enhanced Design */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <MapPin className="h-6 w-6 text-mycol-sea_green mr-2" />
                Address Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Street
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={editedUser.address?.street || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={editedUser.address?.city || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={editedUser.address?.state || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={editedUser.address?.pincode || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <Home className="h-5 w-5 text-mycol-sea_green mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Street</p>
                        <p className="text-gray-700">
                          {user.address?.street || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Building2 className="h-5 w-5 text-mycol-sea_green mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="text-gray-700">
                          {user.address?.city || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPinned className="h-5 w-5 text-mycol-sea_green mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">State</p>
                        <p className="text-gray-700">
                          {user.address?.state || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-mycol-sea_green mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Pincode</p>
                        <p className="text-gray-700">
                          {user.address?.pincode || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Account Information Card */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className={`p-6 bg-gradient-to-r ${roleStyle.gradient}`}>
                <h3 className="text-xl font-semibold text-white">Account Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className={`p-4 ${roleStyle.lightBg} rounded-xl`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Type</span>
                    <span className={`px-4 py-1 rounded-full font-medium ${roleStyle.iconBg} ${roleStyle.textColor}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
                <div className={`p-4 ${roleStyle.lightBg} rounded-xl`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-800">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Action Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickAction}
              className={`w-full p-4 bg-gradient-to-r ${roleStyle.gradient} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-center space-x-3">
                {getRoleIcon()}
                <span className="font-medium">
                  {user.role === 'donor' && 'View My Donations'}
                  {user.role === 'shopkeeper' && 'Manage Inventory'}
                  {user.role === 'institute' && 'View Requests'}
                </span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;