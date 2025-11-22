import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const OrganizerHeader = () => {
  const navigate = useNavigate();
  const { isOrganizer, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">EventBook Organizer</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {isOrganizer ? (
            <>
              <button
                onClick={() => navigate("/organizer/dashboard")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/organizer")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </button>
            </>
          ) : (
            <>
              <a 
                href="/organizer#hero" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </a>
              <a 
                href="/organizer#benefits" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Benefits
              </a>
              <a 
                href="/organizer#features" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a 
                href="/organizer#contact" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </>
          )}
        </nav>

        {isOrganizer ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/organizer/dashboard")}
            >
              Dashboard
            </Button>
            <Button 
              variant="ghost"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => navigate("/organizer/auth")}
          >
            Register Event
          </Button>
        )}
      </div>
    </header>
  );
};

export default OrganizerHeader;
