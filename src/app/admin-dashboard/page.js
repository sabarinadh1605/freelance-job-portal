"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
import { FaTrash, FaSignOutAlt } from "react-icons/fa";

export default function AdminDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      if (userData.role === "admin") {
        fetchClients();
        fetchFreelancers();
        fetchProjects();
      } else {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.rpc(
        "fetch_clients_with_user_data"
      );
      if (error) throw error;
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to fetch clients.");
    }
  };

  const fetchFreelancers = async () => {
    try {
      const { data, error } = await supabase.rpc(
        "fetch_freelancers_with_user_data"
      );
      if (error) throw error;
      setFreelancers(data);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setError("Failed to fetch freelancers.");
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.rpc(
        "fetch_projects_with_clients_freelancers"
      );
      if (error) throw error;
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to fetch projects.");
    }
  };

  const handleDeleteClient = async (clientId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this client?"
    );
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("client_id", clientId);
      if (error) throw error;
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      setError("Failed to delete client.");
    }
  };

  const handleDeleteFreelancer = async (freelancerId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this freelancer?"
    );
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from("freelancers")
        .delete()
        .eq("freelancer_id", freelancerId);
      if (error) throw error;
      fetchFreelancers();
    } catch (error) {
      console.error("Error deleting freelancer:", error);
      setError("Failed to delete freelancer.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("project_id", projectId);
      if (error) throw error;
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete project.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-600 py-2 px-4 rounded-md hover:bg-red-700 flex items-center transition duration-200"
          >
            <FaSignOutAlt className="mr-2" /> Sign Out
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Clients Section */}
        <Section title="Clients" data={clients} onDelete={handleDeleteClient} />

        {/* Freelancers Section */}
        <Section
          title="Freelancers"
          data={freelancers}
          onDelete={handleDeleteFreelancer}
        />

        {/* Projects Section */}
        <Section
          title="Projects"
          data={projects}
          onDelete={handleDeleteProject}
        />
      </div>
    </div>
  );
}

// Section Component for rendering tables
const Section = ({ title, data, onDelete }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <div className="overflow-x-auto bg-gray-800 p-4 rounded-lg shadow-lg">
      {data.length > 0 ? (
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-700">
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-300"
                >
                  {key.replace(/_/g, " ").toUpperCase()}
                </th>
              ))}
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-700 hover:bg-gray-600 transition-all"
              >
                {Object.values(item).map((value, idx) => (
                  <td key={idx} className="px-4 py-3 text-gray-300">
                    {value}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 transition-all flex items-center"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-400">No {title.toLowerCase()} found.</p>
      )}
    </div>
  </div>
);
