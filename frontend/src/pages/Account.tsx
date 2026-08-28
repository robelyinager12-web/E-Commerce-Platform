import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from "../services/address.service";
import { SavedAddress, SavedAddressInput } from "../types/address.types";
import { SavedAddressCard } from "../components/account/SavedAddressCard";
import { SavedAddressForm } from "../components/account/SavedAddressForm";
import { getErrorMessage } from "../utils/getErrorMessage";

type FormMode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; address: SavedAddress };

export function Account() {
  const { user, logout } = useAuth();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses()
      .then(setAddresses)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(input: SavedAddressInput) {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await createAddress(input);
      // Re-fetch rather than just appending, since setting a new default
      // address un-defaults the previous one server-side.
      setAddresses(await fetchAddresses());
      setFormMode({ kind: "closed" });
      void created;
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(id: string, input: SavedAddressInput) {
    setError(null);
    setIsSubmitting(true);
    try {
      await updateAddress(id, input);
      setAddresses(await fetchAddresses());
      setFormMode({ kind: "closed" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Your account</h1>

      <section className="card mb-10 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Profile</h2>
        <div className="grid grid-cols-1 gap-3 font-sans text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted">Name</p>
            <p className="text-ink">
              {user.firstName} {user.lastName}
            </p>
          </div>
          <div>
            <p className="text-muted">Email</p>
            <p className="text-ink">{user.email}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-4">
          <Link to="/orders" className="btn-secondary !py-2 !text-sm">
            View order history
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="font-sans text-sm text-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Saved addresses</h2>
          {formMode.kind === "closed" && (
            <button
              type="button"
              onClick={() => setFormMode({ kind: "create" })}
              className="font-sans text-sm text-teal hover:underline"
            >
              + Add address
            </button>
          )}
        </div>

        {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

        {formMode.kind === "create" && (
          <div className="mb-6">
            <SavedAddressForm
              onSubmit={handleCreate}
              onCancel={() => setFormMode({ kind: "closed" })}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {formMode.kind === "edit" && (
          <div className="mb-6">
            <SavedAddressForm
              existing={formMode.address}
              onSubmit={(input) => handleUpdate(formMode.address.id, input)}
              onCancel={() => setFormMode({ kind: "closed" })}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {isLoading ? (
          <p className="font-sans text-sm text-muted">Loading…</p>
        ) : addresses.length === 0 && formMode.kind === "closed" ? (
          <p className="font-sans text-sm text-muted">No saved addresses yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <SavedAddressCard
                key={address.id}
                address={address}
                onEdit={() => setFormMode({ kind: "edit", address })}
                onDelete={() => handleDelete(address.id)}
                isDeleting={deletingId === address.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}