import { GalleryVerticalEndIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

import Loader from "@/components/loader";
import { LoginForm } from "@/components/login-form";
import { authClient } from "@/lib/auth-client";

export function meta() {
  return [{ title: "Login | wikiora" }];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      navigate("/dashboard", { replace: true });
    }
  }, [isPending, navigate, session]);

  if (isPending || session) {
    return (
      <main className="flex min-h-0 items-center justify-center bg-muted p-6 md:p-10">
        <Loader />
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" aria-hidden="true" />
          </div>
          wikiora
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
