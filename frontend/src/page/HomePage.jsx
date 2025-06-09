
import { Shield, Heart, Hand, Box, Check, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ImageCarousel = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/Donation.jpg", "Donation2.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl shadow-2xl">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentImage * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Donation Preview ${index + 1}`}
            className="w-full flex-shrink-0 object-cover"
          />
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2 h-2 rounded-full transition-colors ${currentImage === index ? "bg-peach-500" : "bg-white/50"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Transparent Donations",
      description: "No direct money transfer to ensure funds are used correctly",
      color: "bg-beige-100 text-beige-700",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Support Needy Institutes",
      description: "Help orphanages, elderly homes, and food providers",
      color: "bg-peach-100 text-peach-600",
    },
    {
      icon: <Hand className="w-8 h-8" />,
      title: "Direct Item Donation",
      description: "Donate specific items like groceries, medicines, etc.",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: <Box className="w-8 h-8" />,
      title: "Supplier Network",
      description: "Connect with nearby suppliers for efficient delivery",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: <Check className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Feedback system to ensure quality of donated items",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Efficient Distribution",
      description: "Avoid cartelization by distributing donations fairly",
      color: "bg-teal-100 text-teal-600",
    },
  ];

  const steps = [
    {
      title: "Raise Requirement",
      description: "Institutes raise their needs for groceries or other items",
      icon: "📝",
    },
    {
      title: "Donate Items",
      description: "Donors choose to donate specific items or amounts",
      icon: "❤️",
    },
    {
      title: "Supplier Fulfillment",
      description: "Nearby suppliers fulfill the order and deliver to the institute",
      icon: "🚚",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-white overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative bg-[#003567] text-white">
  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
  <div className="container mx-auto px-6 py-24 relative z-10">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:w-1/2 text-center lg:text-left"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Handout to Needy
          </span>
          <br />
          Connecting Donors with Needy Institutes
        </h1>
        <p className="text-lg mb-8 text-gray-200 max-w-2xl">
          A transparent platform to donate groceries and essentials to orphanages, elderly homes, and food providers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-[#003567] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
          >
            Donate Now
          </motion.button>
          <button className="border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
            Learn More
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:w-1/2 relative"
      >
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="absolute inset-0 border border-white/10 rounded-2xl" />
          <ImageCarousel />
        </div>
      </motion.div>
    </div>
  </div>
</header>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We ensure transparency, efficiency, and trust in every donation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div
                  className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-beige-50 to-beige-100 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple and transparent process to ensure your donations reach the needy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 h-1 bg-beige-200 hidden lg:block z-0" />
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative bg-white p-8 rounded-2xl shadow-lg text-center z-10"
              >
                <div className="w-20 h-20 bg-peach-500 text-3xl rounded-full flex items-center justify-center text-white mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-peach-500 text-white px-4 py-1 rounded-full text-sm">
                  Step {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[url('/pattern.svg')] bg-cover">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Join Us in Making a Difference
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Be a part of our mission to support needy institutes with transparency and trust.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-peach-500 text-blue px-12 py-4 rounded-xl font-semibold hover:bg-peach-600 transition-all shadow-lg"
            >
              Get Started Now
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;