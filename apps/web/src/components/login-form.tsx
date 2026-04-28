import { useForm } from "@tanstack/react-form";
import { Button } from "@wikiora/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wikiora/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@wikiora/ui/components/field";
import { Input } from "@wikiora/ui/components/input";
import { cn } from "@wikiora/ui/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";
type SocialProvider = "github" | "google";

const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const content = {
  "sign-in": {
    title: "Welcome back",
    description: "Login with your GitHub or Google account",
    submit: "Login",
    submitting: "Logging in...",
    switchText: "Don't have an account?",
    switchAction: "Sign up",
  },
  "sign-up": {
    title: "Create an account",
    description: "Sign up with your GitHub or Google account",
    submit: "Create account",
    submitting: "Creating account...",
    switchText: "Already have an account?",
    switchAction: "Login",
  },
} satisfies Record<
  AuthMode,
  {
    title: string;
    description: string;
    submit: string;
    submitting: string;
    switchText: string;
    switchAction: string;
  }
>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null);
  const navigate = useNavigate();
  const copy = content[mode];
  const socialAction = mode === "sign-in" ? "Login" : "Sign up";

  const signInForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            toast.success("Logged in");
            navigate("/dashboard", { replace: true });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText || "Unable to log in");
          },
        },
      );
    },
    validators: {
      onSubmit: signInSchema,
    },
  });

  const signUpForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            toast.success("Account created");
            navigate("/dashboard", { replace: true });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText || "Unable to create account");
          },
        },
      );
    },
    validators: {
      onSubmit: signUpSchema,
    },
  });

  async function handleSocialLogin(provider: SocialProvider) {
    setSocialPending(provider);

    await authClient.signIn.social(
      {
        provider,
        callbackURL: "/dashboard",
        errorCallbackURL: "/login",
        requestSignUp: mode === "sign-up",
      },
      {
        onError: (error) => {
          toast.error(
            error.error.message ||
              error.error.statusText ||
              `Unable to continue with ${provider}`,
          );
          setSocialPending(null);
        },
      },
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Button
                variant="outline"
                type="button"
                disabled={socialPending !== null}
                onClick={() => handleSocialLogin("github")}
              >
                {socialPending === "github" ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <GithubIcon />
                )}
                {socialAction} with GitHub
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={socialPending !== null}
                onClick={() => handleSocialLogin("google")}
              >
                {socialPending === "google" ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <GoogleIcon />
                )}
                {socialAction} with Google
              </Button>
            </Field>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              Or continue with
            </FieldSeparator>

            {mode === "sign-in" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  signInForm.handleSubmit();
                }}
              >
                <FieldGroup>
                  <signInForm.Field name="email">
                    {(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          autoComplete="email"
                          placeholder="m@example.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  </signInForm.Field>
                  <signInForm.Field name="password">
                    {(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0}>
                        <div className="flex items-center">
                          <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                          <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          autoComplete="current-password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  </signInForm.Field>
                  <signInForm.Subscribe
                    selector={(state) => ({
                      canSubmit: state.canSubmit,
                      isSubmitting: state.isSubmitting,
                    })}
                  >
                    {({ canSubmit, isSubmitting }) => (
                      <Field>
                        <SubmitButton
                          canSubmit={canSubmit}
                          isSubmitting={isSubmitting}
                          label={copy.submit}
                          loadingLabel={copy.submitting}
                          socialPending={socialPending}
                        />
                        <AuthModeSwitch mode={mode} setMode={setMode} />
                      </Field>
                    )}
                  </signInForm.Subscribe>
                </FieldGroup>
              </form>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  signUpForm.handleSubmit();
                }}
              >
                <FieldGroup>
                  <signUpForm.Field name="name">
                    {(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="text"
                          autoComplete="name"
                          placeholder="Jane Doe"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  </signUpForm.Field>
                  <signUpForm.Field name="email">
                    {(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          autoComplete="email"
                          placeholder="m@example.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  </signUpForm.Field>
                  <signUpForm.Field name="password">
                    {(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          autoComplete="new-password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  </signUpForm.Field>
                  <signUpForm.Subscribe
                    selector={(state) => ({
                      canSubmit: state.canSubmit,
                      isSubmitting: state.isSubmitting,
                    })}
                  >
                    {({ canSubmit, isSubmitting }) => (
                      <Field>
                        <SubmitButton
                          canSubmit={canSubmit}
                          isSubmitting={isSubmitting}
                          label={copy.submit}
                          loadingLabel={copy.submitting}
                          socialPending={socialPending}
                        />
                        <AuthModeSwitch mode={mode} setMode={setMode} />
                      </Field>
                    )}
                  </signUpForm.Subscribe>
                </FieldGroup>
              </form>
            )}
          </FieldGroup>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

function AuthModeSwitch({
  mode,
  setMode,
}: {
  mode: AuthMode;
  setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
}) {
  const copy = content[mode];

  return (
    <div className="text-center text-xs/relaxed text-muted-foreground">
      {copy.switchText}{" "}
      <Button
        type="button"
        variant="link"
        className="h-auto p-0 text-xs"
        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
      >
        {copy.switchAction}
      </Button>
    </div>
  );
}

function SubmitButton({
  canSubmit,
  isSubmitting,
  label,
  loadingLabel,
  socialPending,
}: {
  canSubmit: boolean;
  isSubmitting: boolean;
  label: string;
  loadingLabel: string;
  socialPending: SocialProvider | null;
}) {
  return (
    <Button type="submit" disabled={!canSubmit || isSubmitting || socialPending !== null}>
      {isSubmitting ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.19-1.79 4.13-1.15 1.15-2.93 2.4-6.05 2.4-4.83 0-8.6-3.89-8.6-8.72s3.77-8.72 8.6-8.72c2.6 0 4.51 1.03 5.91 2.35l2.31-2.31C18.75 1.44 16.13 0 12.48 0 5.87 0 .31 5.39.31 12s5.56 12 12.17 12c3.57 0 6.27-1.17 8.37-3.36 2.16-2.16 2.84-5.21 2.84-7.67 0-.76-.05-1.47-.17-2.05z"
        fill="currentColor"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"
        fill="currentColor"
      />
    </svg>
  );
}
