import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FormField } from "../components/common/FormField";
import { getErrorMessage } from "../utils/getErrorMessage";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="mb-2 font-display text-3xl font-semibold text-ink">Create your account</h1>
      <p className="mb-8 font-sans text-sm text-muted">
        Join Aurora Market for faster checkout and order tracking.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label="First name"
            required
            value={form.firstName}
            onChange={updateField("firstName")}
          />
          <FormField
            id="lastName"
            label="Last name"
            required
            value={form.lastName}
            onChange={updateField("lastName")}
          />
        </div>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={updateField("email")}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={updateField("password")}
        />
        <p className="-mt-3 font-sans text-xs text-muted">
          At least 8 characters, with a letter and a number.
        </p>

        {error && (
          <p className="rounded-sm bg-red-50 px-3.5 py-2.5 font-sans text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary mt-2" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center font-sans text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-teal hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}