import { Link } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useMobile } from "@/hooks/useMobile";
import ClientSearch from "../../common/ClientSearch";
import { Globe, Menu, User } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";

export default function ClientHeader() {
  const isMobile = useMobile();

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="w-[1500px] m-auto flex h-26 items-center justify-between px-3 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="text-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </div>
          <span className="hidden text-xl font-bold md:inline-block">
            Vinaside
          </span>
        </Link>

        <ClientSearch />
        {/* User Menu */}
        <div className="flex items-center gap-2xl ">
          <ThemeToggle />
          {!isMobile && (
            <Button
              variant="ghost"
              className="hidden rounded-full text-sm font-medium md:flex"
            >
              Trở thành host
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="hidden rounded-full md:flex"
          >
            <Globe className="h-5 w-5" />
            <span className="sr-only">Language</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex gap-2 rounded-full border-gray-200 px-4 py-2"
              >
                <Menu className="h-5 w-5" />
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className={`
                  z-50 mt-2 w-56 rounded-2xl
                  border border-[hsl(var(--border))]
                  bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]
                  p-3 shadow-2xl
                `}
            >
              <DropdownMenuItem className="font-medium">
                <Link to="/register" className="w-full">
                  Sign up
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/login" className="w-full">
                  Log in
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Airbnb your home</DropdownMenuItem>
              <DropdownMenuItem>Host an experience</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
