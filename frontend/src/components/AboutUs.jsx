import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Code, Palette, Database, Brain } from "lucide-react";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Pruthvij Desai",
      role: "ML & Backend Developer",
      description: "Specialized in machine learning algorithms and robust backend architecture. Passionate about creating scalable and efficient solutions.",
      skills: ["Machine Learning", "Backend Development", "Python", "Node.js"],
      icon: <Database className="w-6 h-6" />,
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      name: "Shruti Ware",
      role: "Frontend Developer",
      description: "Expert in creating beautiful and responsive user interfaces. Focused on delivering exceptional user experiences through modern web technologies.",
      skills: ["React.js", "UI/UX", "JavaScript", "CSS"],
      icon: <Code className="w-6 h-6" />,
      gradient: "from-pink-500 to-rose-600"
    },
    {
      name: "Sharvari Borse",
      role: "ML & Frontend Developer",
      description: "Bridging the gap between ML and frontend development. Creating intuitive interfaces for complex ML applications.",
      skills: ["Machine Learning", "React.js", "Python", "Data Visualization"],
      icon: <Brain className="w-6 h-6" />,
      gradient: "from-purple-500 to-violet-600"
    },
    {
      name: "Rohit Kuber",
      role: "UI/UX & ML Developer",
      description: "Combining the art of design with the science of machine learning. Creating beautiful and intelligent user experiences.",
      skills: ["UI/UX Design", "Machine Learning", "Figma", "Python"],
      icon: <Palette className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-600"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-mycol-brunswick_green mb-4">
            Meet Our Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're a passionate team of developers and designers working together to create
            meaningful solutions that make a difference in people's lives.
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
            >
              <div className={`h-2 bg-gradient-to-r ${member.gradient}`} />
              <div className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${member.gradient} flex items-center justify-center mb-4`}>
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-mycol-brunswick_green font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {member.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex space-x-3 text-gray-400">
                  <a href="#" className="hover:text-gray-600 transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="#" className="hover:text-gray-600 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="hover:text-gray-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-mycol-brunswick_green mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            At CareConnect, we're committed to bridging the gap between donors and those in need.
            Through innovative technology and compassionate service, we're creating a platform
            that makes giving easier and more impactful than ever before.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs; 