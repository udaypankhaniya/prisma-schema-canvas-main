import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Zap, 
  Users, 
  Github, 
  Star, 
  Download, 
  ArrowRight, 
  Eye, 
  Code,
  Palette,
  Share2,
  FileText,
  Terminal
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const features = [
    {
      icon: <Database className="w-6 h-6 text-indigo-600" />,
      title: "Visual Schema Design",
      description: "Design your Prisma schema visually with an intuitive drag-and-drop interface."
    },
    {
      icon: <Eye className="w-6 h-6 text-green-600" />,
      title: "Real-time Preview",
      description: "See your schema come to life with instant visual feedback and relationship mapping."
    },
    {
      icon: <Code className="w-6 h-6 text-blue-600" />,
      title: "Code Generation",
      description: "Export clean, production-ready Prisma schema files with proper syntax."
    },
    {
      icon: <Palette className="w-6 h-6 text-purple-600" />,
      title: "Auto Layout",
      description: "Intelligent positioning algorithms to organize your models beautifully."
    },
    {
      icon: <Share2 className="w-6 h-6 text-orange-600" />,
      title: "Import & Export",
      description: "Import existing schemas or export your designs to share with your team."
    },
    {
      icon: <Terminal className="w-6 h-6 text-red-600" />,
      title: "Developer Friendly",
      description: "Built by developers, for developers. Clean code and best practices."
    }
  ];

  const stats = [
    { label: "Models Created", value: "10K+", icon: <Database className="w-5 h-5" /> },
    { label: "GitHub Stars", value: "2.5K+", icon: <Star className="w-5 h-5" /> },
    { label: "Active Users", value: "5K+", icon: <Users className="w-5 h-5" /> },
    { label: "Downloads", value: "50K+", icon: <Download className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Prisma Canvas
            </span>
            <Badge variant="secondary" className="ml-2">Open Source</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a href="https://github.com/udaypankhaniya/prisma-schema-canvas-main" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a href="https://github.com/udaypankhaniya/prisma-schema-canvas-main#prisma-schema-canvas" target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4" />
                Docs
              </a>
            </Button>
            <Button onClick={onGetStarted} className="gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 px-3 py-1">
            <Zap className="w-4 h-4 mr-2" />
            Visual Database Design Made Simple
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Design Your{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Prisma Schema
            </span>{' '}
            Visually
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Create, visualize, and manage your database schema with an intuitive drag-and-drop interface. 
            Perfect for developers, architects, and teams who want to design databases visually.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" onClick={onGetStarted} className="gap-2 px-8 py-3">
              <Database className="w-5 h-5" />
              Start Designing
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8 py-3" asChild>
              <a href="https://github.com/udaypankhaniya/prisma-schema-canvas-main" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </Button>
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-indigo-600">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to make database schema design intuitive and efficient.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Designing?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers who are already using Prisma Canvas to design their schemas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={onGetStarted}
                className="gap-2 px-8 py-3"
              >
                <Database className="w-5 h-5" />
                Launch Canvas
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 py-3 border-white text-white hover:bg-white hover:text-indigo-600" 
                asChild
              >
                <a href="https://github.com/udaypankhaniya/prisma-schema-canvas-main" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5" />
                  Contribute
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Database className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Prisma Canvas
              </span>
              <Badge variant="outline" className="ml-2">MIT License</Badge>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="https://github.com/udaypankhaniya/prisma-schema-canvas-main#prisma-schema-canvas" className="hover:text-indigo-600 transition-colors">Documentation</a>
              <a href="https://github.com/udaypankhaniya/prisma-schema-canvas-main" className="hover:text-indigo-600 transition-colors">GitHub</a>
              <a href="https://github.com/udaypankhaniya/prisma-schema-canvas-main/issues" className="hover:text-indigo-600 transition-colors">Issues</a>
              <a href="https://github.com/udaypankhaniya/prisma-schema-canvas-main/blob/master/CONTRIBUTING.md" className="hover:text-indigo-600 transition-colors">Contributing</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};