"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient"; // Import the Supabase client
import { FaUser, FaSignOutAlt, FaProjectDiagram, FaTrash } from "react-icons/fa"; // Import React Icons

export default function FreelancerDashboard() {
  const [user, setUser] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [currentProjects, setCurrentProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchFreelancerData(userData.user_id);
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchFreelancerData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("freelancers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setFreelancer(data);
      fetchAvailableProjects();
      fetchCurrentProjects(data.freelancer_id);
    } catch (error) {
      console.error("Error fetching freelancer data:", error);
      setError("Failed to fetch freelancer data.");
    }
  };

  const fetchAvailableProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .is("freelancer_id", null);

      if (error) throw error;
      setAvailableProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to fetch available projects.");
    }
  };

  const fetchCurrentProjects = async (freelancerId) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("freelancer_id", freelancerId);

      if (error) throw error;
      setCurrentProjects(data);
    } catch (error) {
      console.error("Error fetching current projects:", error);
      setError("Failed to fetch current projects.");
    }
  };

  const handleSelectProject = async (projectId) => {
    setError("");
    setSelectedProjectId(projectId);

    try {
      const { error } = await supabase
        .from("projects")
        .update({ freelancer_id: freelancer.freelancer_id })
        .eq("project_id", projectId);

      if (error) throw error;

      fetchAvailableProjects();
      fetchCurrentProjects(freelancer.freelancer_id);
    } catch (error) {
      console.error("Error selecting project:", error);
      setError("Failed to select project.");
    }
  };

  const handleCancelProject = async (projectId) => {
    setError("");
    try {
      const { error } = await supabase
        .from("projects")
        .update({ freelancer_id: null })
        .eq("project_id", projectId);

      if (error) throw error;

      fetchAvailableProjects(); // Refresh available projects
      fetchCurrentProjects(freelancer.freelancer_id); // Refresh current projects
    } catch (error) {
      console.error("Error canceling project:", error);
      setError("Failed to cancel project.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">
          Freelancer Details
        </h2>
        {freelancer ? (
          <div className="text-white">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Experience Level:</strong> {freelancer.experience_level}
            </p>
            <p>
              <strong>Skills:</strong>{" "}
              {Array.isArray(freelancer.skills)
                ? freelancer.skills.join(", ")
                : typeof freelancer.skills === "string"
                ? freelancer.skills.split(",").join(", ")
                : "No skills listed"}
            </p>
            <button
              onClick={handleSignOut}
              className="mt-6 flex items-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200"
            >
              <FaSignOutAlt className="mr-2" /> Sign Out
            </button>
          </div>
        ) : (
          <p className="text-gray-400">Loading freelancer data...</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-white mb-6">
          Freelancer Dashboard
        </h1>

        {error && <p className="text-red-500">{error}</p>}

        <h3 className="text-2xl font-semibold text-white mb-2">
          Available Projects
        </h3>
        {availableProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableProjects.map((project) => (
              <div
                key={project.project_id}
                className="bg-gray-800 p-4 rounded-lg shadow-md"
              >
                <h4 className="text-lg font-semibold text-white">
                  {project.project_name}
                </h4>
                <p className="text-gray-400">{project.project_description}</p>
                <p className="text-white mt-2">
                  <strong>Specified Price:</strong> ${project.specified_price}
                </p>
                <button
                  onClick={() => handleSelectProject(project.project_id)}
                  className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
                >
                  <FaProjectDiagram className="mr-2" /> Select Project
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white">No available projects.</p>
        )}

        <h3 className="text-2xl font-semibold text-white mb-2 mt-6">
          Current Projects
        </h3>
        {currentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentProjects.map((project) => (
              <div
                key={project.project_id}
                className="bg-gray-800 p-4 rounded-lg shadow-md"
              >
                <h4 className="text-lg font-semibold text-white">
                  {project.project_name}
                </h4>
                <p className="text-gray-400">{project.project_description}</p>
                <p className="text-white mt-2">
                  <strong>Specified Price:</strong> ${project.specified_price}
                </p>
                <button
                  onClick={() => handleCancelProject(project.project_id)}
                  className="mt-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 flex items-center"
                >
                  <FaTrash className="mr-2" /> Cancel Project
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white">No current projects.</p>
        )}
      </div>
    </div>
  );
}
