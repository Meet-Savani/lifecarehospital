import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PredefinedChat from "@/components/PredefinedChat";

export default function PatientChat() {
  return (
    <div className="min-h-screen bg-muted/30 transition-colors duration-300">
      <DashboardLayout role="patient">
        <PredefinedChat />
      </DashboardLayout>
    </div>
  );
} 
