import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { FiUser, FiMail, FiHome, FiPhone, FiBox, FiShoppingBag, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const DonationProcess = () => {
    const { instituteId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [radius, setRadius] = useState(500);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const [selectedShops, setSelectedShops] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `/api/v1/donors/institute/${instituteId}/nearby-shops?radius=${radius}`,
                    { withCredentials: true }
                );

                if (response.data.status === "success") {
                    setData(response.data.data);
                    console.log("Fetched data:", response.data.data);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, [instituteId, radius]);

    useEffect(() => {
        if (!data || !mapContainer.current) return;

        // Function to create a GeoJSON circle
        const createCircleGeoJSON = (center, radius) => {
            const degreesPerMeter = 8.983e-6; // Approximate conversion
            const radiusDegrees = radius * degreesPerMeter;
            const coordinates = [];
            for (let i = 0; i < 360; i++) {
                const angle = (i * Math.PI) / 180;
                const dx = radiusDegrees * Math.cos(angle);
                const dy = radiusDegrees * Math.sin(angle);
                coordinates.push([center[0] + dx, center[1] + dy]);
            }
            coordinates.push(coordinates[0]); // Close the circle
            return {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [coordinates]
                }
            };
        };

        const { institute, shops } = data;
        const instituteCoords = institute.geolocation.coordinates;

        // Clear previous map instance
        if (map.current) {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
            if (map.current.getLayer('circleLayer')) map.current.removeLayer('circleLayer');
            if (map.current.getLayer('circleBorder')) map.current.removeLayer('circleBorder');
            if (map.current.getSource('circleSource')) map.current.removeSource('circleSource');
            map.current.remove();
            map.current = null;
        }

        // Initialize map
        maptilersdk.config.apiKey = "DrLHBz4sGQJTXNNCWdc3";
        map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: maptilersdk.MapStyle.STREETS,
            center: instituteCoords,
            zoom: 13
        });

        // Add features when map is loaded
        map.current.on('load', () => {
            console.log("Map loaded");

            // Create GeoJSON circle
            const circleGeoJSON = createCircleGeoJSON(instituteCoords, radius);

            // Add circle source and layer
            map.current.addSource('circleSource', {
                type: 'geojson',
                data: circleGeoJSON
            });

            map.current.addLayer({
                id: 'circleLayer',
                type: 'fill',
                source: 'circleSource',
                paint: {
                    'fill-color': '#4CAF50',
                    'fill-opacity': 0.1
                }
            });

            map.current.addLayer({
                id: 'circleBorder',
                type: 'line',
                source: 'circleSource',
                paint: {
                    'line-color': '#4CAF50',
                    'line-width': 2,
                    'line-opacity': 0.8
                }
            });

            // Add institute marker
            const instituteMarker = new maptilersdk.Marker({ 
                color: "#DD5746",
                scale: 1.2
            })
                .setLngLat(instituteCoords)
                .setPopup(new maptilersdk.Popup().setHTML(`
                    <div class="p-2">
                        <h3 class="font-semibold">${institute.institute_name}</h3>
                        <p class="text-sm text-gray-600">${institute.institute_type}</p>
                    </div>
                `))
                .addTo(map.current);
            markersRef.current.push(instituteMarker);

            // Add shop markers
            const bounds = new maptilersdk.LngLatBounds(instituteCoords, instituteCoords);
            shops.forEach(shop => {
                if (shop.location?.coordinates) {
                    const hasInventory = shop.inventory.length > 0;
                    const marker = new maptilersdk.Marker({ 
                        color: hasInventory ? "#4CAF50" : "#FFA726",
                        scale: 1
                    })
                        .setLngLat(shop.location.coordinates)
                        .setPopup(new maptilersdk.Popup().setHTML(`
                            <div class="p-2">
                                <h3 class="font-semibold">${shop.shopName}</h3>
                                <p class="text-sm text-gray-600">${(shop.distance/1000).toFixed(2)} km away</p>
                                <p class="text-sm text-gray-600">
                                    ${hasInventory ? 
                                        `${shop.inventory.length} items available` : 
                                        'No items in inventory'}
                                </p>
                            </div>
                        `))
                        .addTo(map.current);
                    markersRef.current.push(marker);
                    bounds.extend(shop.location.coordinates);
                }
            });

            // Fit map to bounds
            map.current.fitBounds(bounds, { padding: 50 });
        });

        return () => {
            if (map.current) {
                markersRef.current.forEach(marker => marker.remove());
                if (map.current.getLayer('circleLayer')) map.current.removeLayer('circleLayer');
                if (map.current.getLayer('circleBorder')) map.current.removeLayer('circleBorder');
                if (map.current.getSource('circleSource')) map.current.removeSource('circleSource');
                map.current.remove();
                map.current = null;
            }
        };
    }, [data, radius]);

    if (loading) return <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mycol-mint"></div>
    </div>;

    if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

    if (!data) return null;

    const { institute, shops } = data;

    const handleShopSelection = (shop) => {
        setSelectedShops(prev => {
            const isSelected = prev.some(s => s._id === shop._id);
            if (isSelected) {
                return prev.filter(s => s._id !== shop._id);
            } else {
                return [...prev, shop];
            }
        });
    };

    const handleProceedToDonation = () => {
        if (selectedShops.length === 0) {
            alert('Please select at least one shop');
            return;
        }

        // Log the data being passed
        console.log('Selected shops data:', selectedShops);

        const shopData = selectedShops.map(shop => ({
            _id: shop._id,
            shopName: shop.shopName,
            contactInfo: shop.contactInfo,
            address: shop.user.address,
            inventory: shop.inventory.map(item => ({
                itemName: item.itemName,  // Make sure this matches the backend expectation
                quantity: item.quantity,
                unit: item.unit,
                pricePerUnit: item.pricePerUnit,
                category: item.category
            }))
        }));

        console.log('Processed shop data:', shopData);

        navigate(`/donate/${instituteId}/details`, { 
            state: { 
                selectedShops: shopData,
                instituteId 
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-mycol-brunswick_green hover:text-mycol-mint"
                >
                    <FiArrowLeft className="mr-2" /> Back
                </button>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h1 className="text-2xl font-bold text-mycol-brunswick_green mb-4">
                        {institute.institute_name}
                    </h1>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center mb-2">
                                <FiUser className="mr-2 text-mycol-mint" />
                                <span>{institute.user.name}</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <FiMail className="mr-2 text-mycol-mint" />
                                <span>{institute.user.email}</span>
                            </div>
                            <div className="flex items-start">
                                <FiHome className="mr-2 mt-1 text-mycol-mint" />
                                <span>{institute.user.address.street}, {institute.user.address.city}, {institute.user.address.state} - {institute.user.address.pincode}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-700 mb-2">Type: {institute.institute_type}</p>
                            <p className="text-gray-600">{institute.description}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Radius: {radius} meters
                    </label>
                    <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div ref={mapContainer} style={{ height: '500px', width: '100%' }} />
                        <div className="p-4 border-t">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#DD5746] mr-2"></div>
                                    <span>Institute</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#4CAF50] mr-2"></div>
                                    <span>Shops with Inventory</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#FFA726] mr-2"></div>
                                    <span>Shops without Inventory</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full border-2 border-[#4CAF50] bg-[#4CAF5020] mr-2"></div>
                                    <span>Search Radius ({radius}m)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Available Shops ({shops.length})</h2>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {shops.map(shop => (
                                <div key={shop._id} className="border rounded-lg p-4 hover:border-mycol-mint transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{shop.shopName}</h3>
                                            <p className="text-sm text-gray-600">Owner: {shop.user.name}</p>
                                            <p className="text-sm text-gray-600">{(shop.distance/1000).toFixed(2)} km away</p>
                                        </div>
                                        <div className={`${shop.inventory.length > 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} px-3 py-1 rounded-full text-sm`}>
                                            {shop.inventory.length} items
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiPhone className="mr-2" />
                                            {shop.contactInfo.phone}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiMail className="mr-2" />
                                            {shop.contactInfo.email}
                                        </div>
                                        <div className="flex items-start text-sm text-gray-600">
                                            <FiHome className="mr-2 mt-1" />
                                            <span>{shop.user.address.street}, {shop.user.address.city}</span>
                                        </div>
                                    </div>

                                    {shop.inventory.length > 0 && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium mb-2">Available Items</h4>
                                            <div className="grid gap-2">
                                                {shop.inventory.map((item, idx) => (
                                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <FiBox className="text-mycol-mint mr-2" />
                                                            <div>
                                                                <div className="font-medium">{item.itemName}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {item.quantity} {item.unit} • {item.category}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            ₹{item.pricePerUnit}/{item.unit}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => handleShopSelection(shop)}
                                        className={`w-full mt-4 py-2 px-4 rounded-lg transition-colors flex items-center justify-center
                                            ${selectedShops.some(s => s._id === shop._id) 
                                                ? 'bg-mycol-brunswick_green text-white' 
                                                : 'bg-mycol-mint text-white hover:bg-mycol-mint-2'}`}
                                    >
                                        <FiShoppingBag className="mr-2" />
                                        {selectedShops.some(s => s._id === shop._id) ? 'Selected' : 'Select for Donation'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {shops.length > 0 && (
                    <div className="fixed bottom-8 right-8">
                        <button
                            onClick={handleProceedToDonation}
                            className="bg-mycol-brunswick_green text-white px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-90 transition-colors flex items-center"
                            disabled={selectedShops.length === 0}
                        >
                            Proceed with {selectedShops.length} shop{selectedShops.length !== 1 ? 's' : ''} 
                            <FiArrowRight className="ml-2" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationProcess;