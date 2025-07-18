"use client"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  Shield,
  ArrowRight,
  Play,
  Star
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Trophy,
      title: "Tournament Management",
      description: "Organize and manage sports tournaments with ease. Track brackets, schedules, and results in real-time."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Connect with teammates, share strategies, and coordinate training sessions effectively."
    },
    {
      icon: Calendar,
      title: "Event Scheduling",
      description: "Plan and schedule games, practices, and team meetings with our intuitive calendar system."
    },
    {
      icon: Target,
      title: "Performance Tracking",
      description: "Monitor your progress with detailed analytics and performance metrics."
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Visualize your improvement over time with comprehensive charts and reports."
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security and privacy controls."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "500+", label: "Tournaments" },
    { number: "50+", label: "Sports" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-4 h-4 mr-2" />
              The Ultimate Sports Management Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Elevate Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Sports Game</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect, compete, and conquer with our comprehensive sports management platform. 
              From tournament organization to performance tracking, we've got everything you need to excel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => router.push('/signup')}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push('/about')}
              >
                <Play className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help athletes, teams, and organizers achieve their goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Sports Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of athletes and teams who are already using our platform to achieve their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push('/signup')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/login')}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
