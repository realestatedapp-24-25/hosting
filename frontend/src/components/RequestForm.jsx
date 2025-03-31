import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const RequestForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    priority: "medium",
    comments: "",
    items: [{ name: "", quantity: "", unit: "" }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", quantity: "", unit: "" }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/v1/requests", formData, {
        withCredentials: true,
      });

      toast.success("Request created successfully!");
      navigate("/profile/requests");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create request";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="FOOD">Food</option>
            <option value="MEDICAL">Medical</option>
            <option value="EDUCATION">Education</option>
            <option value="CLOTHING">Clothing</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Items</label>
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                className="flex-1 p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                className="w-24 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Unit"
                value={item.unit}
                onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                className="w-24 p-2 border rounded"
                required
              />
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="mt-2 text-blue-500 hover:text-blue-700"
          >
            + Add Item
          </button>
        </div>

        <div>
          <label className="block mb-2">Comments</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestForm;