import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Sparkles, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-accent/5 px-4">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <BookOpen className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Book Publisher Pro</h1>
            <p className="text-xl text-muted-foreground">
              Create, design, and publish illustrated books with professional quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="p-4 rounded-lg bg-card border border-border">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-card-foreground">Design</h3>
              <p className="text-sm text-muted-foreground">Professional cover templates</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-card-foreground">Edit</h3>
              <p className="text-sm text-muted-foreground">Multi-page editor with fonts</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-card-foreground">Export</h3>
              <p className="text-sm text-muted-foreground">Amazon KDP ready PDFs</p>
            </div>
          </div>

          <div>
            <a href={getLoginUrl()}>
              <Button size="lg" className="w-full md:w-auto">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name || 'Author'}</h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Create New Book</h2>
            <p className="text-muted-foreground mb-4">Start a new project and begin writing</p>
            <Button className="w-full">New Book</Button>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Recent Books</h2>
            <p className="text-muted-foreground mb-4">Your recent projects</p>
            <Button variant="outline" className="w-full">View All</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
