import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
        document.body.classList.add("light");
      } else {
        root.classList.add("dark");
        root.classList.remove("light");
        document.body.classList.remove("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const newTheme = theme === "dark" ? "light" : "dark";
    
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      document.body.classList.add("light");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      document.body.classList.remove("light");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
