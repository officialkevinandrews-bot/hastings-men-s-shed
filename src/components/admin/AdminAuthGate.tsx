import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Lock, Loader2, ArrowLeft, KeyRound, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { activateAdminAccount, requestAdminPasswordReset } from "@/lib/admin.functions";
import { useSiteContent } from "@/lib/site-content";

type AuthMode = "signin" | "activate" | "reset";

interface AdminAuthGateProps {
  deniedEmail?: string | null;
  onSignedIn: () => void;
}

export function AdminAuthGate({ deniedEmail, onSignedIn }: AdminAuthGateProps) {
  const { images } = useSiteContent();
  const activate = useServerFn(activateAdminAccount);
  const requestReset = useServerFn(requestAdminPasswordReset);

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setErrorMsg(null);
    setInfoMsg(null);
    setGoogleBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/admin`,
      });
      if ("error" in result && result.error) {
        setErrorMsg(result.error.message || "Google sign-in didn't complete. Please try again.");
      } else if (!("redirected" in result && result.redirected)) {
        onSignedIn();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not start Google sign-in.");
    } finally {
      setGoogleBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (mode === "reset") {
      setBusy(true);
      try {
        const res = await requestReset({
          data: { email: cleanEmail, redirectTo: `${window.location.origin}/admin` },
        });
        setInfoMsg(res.message);
      } catch {
        setErrorMsg("Could not send a reset email right now. Please try again.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Please enter a password of at least 8 characters.");
      return;
    }

    if (mode === "activate") {
      if (password !== confirmPassword) {
        setErrorMsg("Those two passwords do not match. Please check and try again.");
        return;
      }
      setBusy(true);
      try {
        const res = await activate({ data: { email: cleanEmail, password } });
        if (!res.ok) {
          setErrorMsg(res.message);
          return;
        }
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (loginErr) {
          setInfoMsg("Your password has been created! You can now sign in below.");
          setMode("signin");
          return;
        }
        onSignedIn();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Could not set up your password.");
      } finally {
        setBusy(false);
      }
      return;
    }

    // Standard email + password sign in
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) {
        setErrorMsg(
          "We couldn't sign you in with that email and password. If this is your first time, click 'First time? Set up your password' below.",
        );
        return;
      }
      onSignedIn();
    } catch {
      setErrorMsg("Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-wood/30 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-bold text-foreground shadow-soft hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Lock className="h-3.5 w-3.5" /> Private Area
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="stripe-bar h-1.5" />
          <div className="p-7 sm:p-9">
            <div className="flex flex-col items-center text-center">
              <img
                src={images["site.logo"]?.image_url}
                alt="Hastings & St Leonards Men's Shed"
                className="h-14 w-auto object-contain"
              />
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> Shed Committee Area
              </span>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                {mode === "signin" && "Committee Sign In"}
                {mode === "activate" && "Set Up Your Password"}
                {mode === "reset" && "Reset Your Password"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin" &&
                  "Only authorised Hastings & St Leonards Men's Shed admins can access this area."}
                {mode === "activate" &&
                  "Once the site owner adds your email, create your password here to sign in."}
                {mode === "reset" && "Enter your authorised email address and we'll send you a reset link."}
              </p>
            </div>

            {deniedEmail && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Access restricted</p>
                  <p className="mt-0.5">
                    <strong>{deniedEmail}</strong> is not on the authorised Shed admin list. Please ask the site owner
                    to add your email, or sign in with your authorised account.
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm font-semibold text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-primary/30 bg-secondary p-3.5 text-sm font-semibold text-primary">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{infoMsg}</span>
              </div>
            )}

            {mode === "signin" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleBusy || busy}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3.5 text-base font-bold text-foreground shadow-xs transition hover:border-primary hover:bg-secondary/50 disabled:opacity-60"
                >
                  {googleBusy ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>

                <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span>or use email &amp; password</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-bold">
                  <Mail className="h-4 w-4 text-primary" /> Email address
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none"
                />
              </label>

              {mode !== "reset" && (
                <label className="block">
                  <span className="mb-1 flex items-center gap-1.5 text-sm font-bold">
                    <KeyRound className="h-4 w-4 text-primary" />{" "}
                    {mode === "activate" ? "Choose a password (8+ characters)" : "Password"}
                  </span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete={mode === "activate" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none"
                  />
                </label>
              )}

              {mode === "activate" && (
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">Type password again</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none"
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={busy || googleBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-base font-bold text-primary-foreground shadow-soft transition hover:brightness-110 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-5 w-5 animate-spin" />}
                {mode === "signin" && "Sign in"}
                {mode === "activate" && "Create my admin password"}
                {mode === "reset" && "Send password reset email"}
              </button>
            </form>

            <div className="mt-6 space-y-2 border-t border-border pt-4 text-center text-sm">
              {mode === "signin" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setInfoMsg(null);
                      setMode("activate");
                    }}
                    className="block w-full font-bold text-primary hover:underline"
                  >
                    First time here? Set up your admin password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setInfoMsg(null);
                      setMode("reset");
                    }}
                    className="block w-full text-muted-foreground hover:text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setInfoMsg(null);
                    setMode("signin");
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
