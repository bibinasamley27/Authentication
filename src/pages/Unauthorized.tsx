import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { motion } from "motion/react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 bg-white border border-slate-200 shadow-lg rounded-2xl text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold font-sans text-slate-950 tracking-tight">
          Access Restricted
        </h1>
        
        <p className="mt-3 text-sm text-slate-500 font-sans leading-relaxed">
          You do not have the required role or administrative privileges to view this page. This action has been logged for security monitoring.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition duration-200 shadow-sm"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-full px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
