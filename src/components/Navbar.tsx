import Link from "next/link";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
  return (
    <nav className="border-b border-border py-5 flex items-center justify-between ">
        <div className="flex items-center gap-6 px-4 sm:px-6">
          <h1 className="text-3xl font-semibold">
            <Link href={"/"}>
              <span className="text-amber-500">Flavor</span>Flow
            </Link>
          </h1>

          {/* <div className="hidden md:flex items-center gap-6"> */}
          {/*   <Link href="/dashboard">Dashboard</Link> */}
          {/* </div> */}
        </div>

        <div className="flex items-center gap-4 px-4 sm:px-6">
          <ModeToggle />
          <Button>Login</Button>
          <Button variant={"ghost"}>Sign Up</Button>
        </div>
    </nav>
  )
}
