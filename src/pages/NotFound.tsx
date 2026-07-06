import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/10">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-8 animate-bounce">
        <Ghost className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button asChild size="lg">
        <Link to="/">Go back Home</Link>
      </Button>
    </div>
  );
}
