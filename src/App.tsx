
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Shell from "@/components/layout/Shell";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import StudentsPage from "./pages/students/StudentsPage";
import AddStudentPage from "./pages/students/AddStudentPage";
import TeachersPage from "./pages/teachers/TeachersPage";
import AddTeacherPage from "./pages/teachers/AddTeacherPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Shell>
                    <Dashboard />
                  </Shell>
                </ProtectedRoute>
              } 
            />
            
            {/* Students Routes */}
            <Route 
              path="/students" 
              element={
                <ProtectedRoute>
                  <Shell>
                    <StudentsPage />
                  </Shell>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students/new" 
              element={
                <ProtectedRoute>
                  <Shell>
                    <AddStudentPage />
                  </Shell>
                </ProtectedRoute>
              } 
            />
            
            {/* Teachers Routes */}
            <Route 
              path="/teachers" 
              element={
                <ProtectedRoute>
                  <Shell>
                    <TeachersPage />
                  </Shell>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teachers/new" 
              element={
                <ProtectedRoute>
                  <Shell>
                    <AddTeacherPage />
                  </Shell>
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect to login if path is empty */}
            <Route path="" element={<Navigate to="/login" />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
