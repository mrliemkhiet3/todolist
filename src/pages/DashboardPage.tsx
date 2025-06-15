import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TasksPage from '../components/TasksPage';
import ProjectsPage from '../components/ProjectsPage';
import AnalyticsPage from '../components/AnalyticsPage';
import SettingsPage from '../components/SettingsPage';
import CalendarPage from '../components/CalendarPage';
import TeamPage from '../components/TeamPage';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const DashboardPage = () => {
  const { fetchTasks, fetchProjects } = useTaskStore();
  const { user, fetchProfile } = useAuthStore();
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Wait for Supabase session to be ready
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsSessionReady(true);
          return;
        }

        if (session?.user) {
          // Ensure profile is loaded
          await fetchProfile();
          // Fetch projects first, then tasks
          await fetchProjects();
          await fetchTasks();
        }
        
        setIsSessionReady(true);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setIsSessionReady(true);
      }
    };

    initializeDashboard();
  }, [user, fetchTasks, fetchProjects, fetchProfile]);

  // Show loading state until session is ready
  if (!isSessionReady) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;