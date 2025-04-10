
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar, Award, ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-institute-500 mr-2" />
            <h1 className="text-2xl font-bold text-institute-500">Scholar Central Connect</h1>
          </div>
          <Button 
            variant="default" 
            onClick={() => navigate("/login")}
            className="bg-institute-500 hover:bg-institute-600"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-r from-institute-50 to-institute-100 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-institute-900 mb-4">
                Transform Your Educational Institution
              </h1>
              <p className="text-lg text-institute-700 mb-8">
                Comprehensive management system for schools, colleges, and universities.
                Streamline administration, enhance teaching, and improve student experiences.
              </p>
              <Button 
                onClick={() => navigate("/login")} 
                className="bg-institute-500 hover:bg-institute-600 text-white px-6 py-3 rounded-lg text-lg flex items-center"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Education Management" 
                className="w-full max-w-md rounded-lg shadow-xl" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-institute-800">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              <div className="bg-institute-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-institute-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-institute-800">User Management</h3>
              <p className="text-gray-600">
                Efficiently manage students, teachers, and administrative staff profiles.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              <div className="bg-institute-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-institute-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-institute-800">Course Management</h3>
              <p className="text-gray-600">
                Create and manage courses, assignments, and study materials.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              <div className="bg-institute-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-institute-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-institute-800">Timetable</h3>
              <p className="text-gray-600">
                Create and manage timetables for different classes and courses.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              <div className="bg-institute-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-institute-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-institute-800">Exams & Grading</h3>
              <p className="text-gray-600">
                Schedule exams, record and analyze student performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-institute-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Educational Institution?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join numerous educational institutions that have already enhanced their administrative efficiency with our platform.
          </p>
          <Button 
            onClick={() => navigate("/login")} 
            variant="outline" 
            className="text-institute-500 bg-white hover:bg-gray-100 px-6 py-3 rounded-lg text-lg"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                <span className="text-xl font-semibold">Scholar Central Connect</span>
              </div>
              <p className="text-gray-400 mt-2">© 2025 All Rights Reserved</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
