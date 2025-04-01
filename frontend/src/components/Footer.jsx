import React from 'react';

const Footer = () => {
    return (
        <div>
            <footer className="bg-[#003567] text-white">
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 border-b border-white/10 pb-8 sm:pb-12">
                        {/* About Section */}
                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Handout to Needy</h4>
                            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                                A transparent platform connecting donors, needy institutes, and suppliers to ensure funds and resources reach those in need without misuse.
                            </p>
                        </div>

                        {/* How It Works Section */}
                        <div>
                            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">How It Works</h4>
                            <ul className="space-y-2 sm:space-y-3">
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Raise Requirements
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Donate Items
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Supplier Fulfillment
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Feedback & Quality Check
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Resources Section */}
                        <div>
                            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h4>
                            <ul className="space-y-2 sm:space-y-3">
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Case Studies
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        FAQs
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Support
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Connect Section */}
                        <div>
                            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Connect</h4>
                            <ul className="space-y-2 sm:space-y-3">
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Twitter
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        LinkedIn
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Contact Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright Section */}
                    <div className="pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-300">
                        © 2024 Handout to Needy. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;