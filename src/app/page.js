"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login"); // Navigates to the login page
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center items-center p-6">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white leading-tight">
          Welcome to Your Freelance Portal
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8">
          Connecting clients and freelancers seamlessly for collaborative success.
        </p>
        <button
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
