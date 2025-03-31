import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { FiPackage, FiClock, FiMapPin, FiMail, FiUser, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const RequestDetail = () => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        fetchRequestDetails();
    }, [id]);

    const fetchRequestDetails = async () => {
        try {
            const response = await axios.get(`/api/v1/requests/${id}`, {
                withCredentials: true
            });
            setRequest(response.data.data.request);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching request details:', err);
            setError(err.response?.data?.message || 'Failed to fetch request details');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (request?.institute?.geolocation?.coordinates) {
            maptilersdk.config.apiKey = "DrLHBz4sGQJTXNNCWdc3";

            if (!map.current) {
                map.current = new maptilersdk.Map({
                    container: mapContainer.current,
                    style: maptilersdk.MapStyle.STREETS,
                    center: request.institute.geolocation.coordinates,
                    zoom: 13,
                });

                // Add marker for institute
                const marker = new maptilersdk.Marker({ color: "#DD5746" })
                    .setLngLat(request.institute.geolocation.coordinates)
                    .setPopup(new maptilersdk.Popup().setHTML(`
                        <div class="font-semibold">${request.institute.institute_name}</div>
                        <div class="text-sm text-gray-600">Requesting Institute</div>
                    `))
                    .addTo(map.current);
            }
        }
    }, [request]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mycol-mint"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 py-12">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/requests')}
                    className="mb-6 text-mycol-brunswick_green hover:text-mycol-mint transition-colors"
                >
                    ← Back to Requests
                </button>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-mycol-brunswick_green text-white p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    {request.institute.institute_name}
                                </h1>
                                <p className="text-mycol-mint">
                                    {request.institute.institute_type.replace('_', ' ')}
                                </p>
                            </div>
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    request.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                }`}
                            >
                                {request.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Request Details */}
                        <div className="space-y-6">
                            {/* Institute Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-4">Institute Information</h2>
                                <div className="space-y-3">
                                    <p className="text-gray-600">
                                        <FiUser className="inline mr-2" />
                                        Contact Person: {request.institute.user.name}
                                    </p>
                                    <p className="text-gray-600">
                                        <FiMail className="inline mr-2" />
                                        Email: {request.institute.user.email}
                                    </p>
                                    <p className="text-gray-600">
                                        <FiCheckCircle className="inline mr-2" />
                                        Verification Status: {request.institute.verification_status ? 'Verified' : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            {/* Requested Items */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Requested Items</h2>
                                <div className="bg-white rounded-lg border border-gray-200">
                                    {request.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 flex justify-between items-center ${
                                                index !== request.items.length - 1 ? 'border-b border-gray-200' : ''
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <FiPackage className="text-mycol-mint mr-3" />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="text-gray-600">
                                                {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Request Details */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Request Details</h2>
                                <div className="space-y-3">
                                    <p className="text-gray-600">
                                        <FiClock className="inline mr-2" />
                                        Requested on: {formatDate(request.createdAt)}
                                    </p>
                                    {request.comments && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 italic">"{request.comments}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Donate Button */}
                            <div className="mt-8">
                                <button
                                    onClick={() => navigate(`/donate/${request.institute._id}`, { 
                                        state: { 
                                            requestId: request._id,
                                            items: request.items 
                                        } 
                                    })}
                                    className="w-full py-3 px-6 bg-mycol-mint text-white rounded-lg 
                                             hover:bg-mycol-mint-2 transition-colors flex items-center 
                                             justify-center space-x-2 font-semibold"
                                >
                                    <span>Proceed to Donate</span>
                                    <FiArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Map */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Location</h2>
                            <div
                                ref={mapContainer}
                                className="h-[400px] w-full rounded-lg overflow-hidden shadow-md"
                            />
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600">
                                    <FiMapPin className="inline mr-2" />
                                    Coordinates: {request.institute.geolocation.coordinates.join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail; 