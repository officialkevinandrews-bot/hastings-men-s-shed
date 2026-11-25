import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Tag,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Loader2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteGalleryCategory,
  deleteGalleryItem,
  reorderGalleryItems,
  seedDefaultGallery,
  upsertGalleryCategory,
  upsertGalleryItem,
} from "@/lib/admin.functions";
import type { GalleryCategoryData, GalleryItemData } from "@/lib/cms-defaults";
import { PhotoUploadButton } from "@/components/admin/PhotoUploadButton";
import { cn } from "@/lib/utils";

interface GalleryTabProps {
  categories: GalleryCategoryData[];
  items: GalleryItemData[];
  galleryFromDb: boolean;
  onRefresh: () => Promise<void>;
}

interface PhotoDraft {
  id?: string;
  title: string;
  category_id: string;
  image_url: string;
  is_visible: boolean;
  is_featured: boolean;
  for_sale: boolean;
  price_label: string;
}

export function GalleryTab({ categories, items, galleryFromDb, onRefresh }: GalleryTabProps) {
  const seedFn = useServerFn(seedDefaultGallery);
  const saveCatFn = useServerFn(upsertGalleryCategory);
  const delCatFn = useServerFn(deleteGalleryCategory);
  const saveItemFn = useServerFn(upsertGalleryItem);
  const delItemFn = useServerFn(deleteGalleryItem);
  const reorderFn = useServerFn(reorderGalleryItems);

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [busy, setBusy] = useState(false);

  // Category controls
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // Photo modal
  const [photoModal, setPhotoModal] = useState<PhotoDraft | null>(null);

  async function ensureSeededFirst(): Promise<boolean> {
    if (galleryFromDb) return true;
    setBusy(true);
    try {
      await seedFn();
      await onRefresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not prepare gallery in database.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleEnableEditing() {
    const ok = await ensureSeededFirst();
    if (ok) toast.success("All 31 existing Shed photos are now ready to edit!");
  }

  async function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) return;
    setBusy(true);
    try {
      await saveCatFn({ data: { name } });
      setNewCatName("");
      toast.success(`Added group "${name}"`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add that group.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRenameCategory(id: string) {
    const name = editingCatName.trim();
    if (!name) return;
    setBusy(true);
    try {
      await saveCatFn({ data: { id, name } });
      setEditingCatId(null);
      toast.success(`Renamed group to "${name}"`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename group.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCategory(cat: GalleryCategoryData) {
    const count = items.filter((i) => i.category_id === cat.id).length;
    const otherCat = categories.find((c) => c.id !== cat.id);
    if (count > 0 && !otherCat) {
      toast.error("You need at least one group remaining.");
      return;
    }
    const msg =
      count > 0
        ? `Delete "${cat.name}"? Its ${count} photo(s) will be safely moved into "${otherCat?.name}".`
        : `Delete the empty group "${cat.name}"?`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      await delCatFn({ data: { id: cat.id, reassignToId: count > 0 ? otherCat?.id : undefined } });
      if (selectedCat === cat.id) setSelectedCat("all");
      toast.success(`Removed group "${cat.name}"`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete group.");
    } finally {
      setBusy(false);
    }
  }

  function openNewPhotoModal() {
    if (!galleryFromDb) {
      toast.info("First click 'Unlock Gallery for Editing' above so your existing photos stay saved.");
      return;
    }
    setPhotoModal({
      title: "",
      category_id: (selectedCat !== "all" ? selectedCat : categories[0]?.id) ?? "",
      image_url: "",
      is_visible: true,
      is_featured: false,
      for_sale: false,
      price_label: "",
    });
  }

  function openEditPhotoModal(item: GalleryItemData) {
    if (!galleryFromDb) {
      toast.info("First click 'Unlock Gallery for Editing' above so your existing photos stay saved.");
      return;
    }
    setPhotoModal({
      id: item.id,
      title: item.title,
      category_id: item.category_id,
      image_url: item.image_url,
      is_visible: item.is_visible,
      is_featured: item.is_featured,
      for_sale: item.for_sale,
      price_label: item.price_label,
    });
  }

  async function handleSavePhoto() {
    if (!photoModal) return;
    if (!photoModal.image_url) {
      toast.error("Please choose a photo to upload first.");
      return;
    }
    if (!photoModal.title.trim()) {
      toast.error("Please give this item a name.");
      return;
    }
    if (!photoModal.category_id) {
      toast.error("Please choose a group for this photo.");
      return;
    }
    setBusy(true);
    try {
      await saveItemFn({
        data: {
          id: photoModal.id,
          title: photoModal.title.trim(),
          category_id: photoModal.category_id,
          image_url: photoModal.image_url,
          is_visible: photoModal.is_visible,
          is_featured: photoModal.is_featured,
          for_sale: photoModal.for_sale,
          price_label: photoModal.price_label.trim(),
        },
      });
      toast.success(photoModal.id ? "Photo updated!" : "New photo added to 'Made in the Shed'!");
      setPhotoModal(null);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save photo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleQuickToggle(
    item: GalleryItemData,
    patch: Partial<Pick<GalleryItemData, "is_visible" | "is_featured" | "for_sale">>,
  ) {
    if (!galleryFromDb) return;
    setBusy(true);
    try {
      await saveItemFn({
        data: {
          id: item.id,
          title: item.title,
          category_id: item.category_id,
          image_url: item.image_url,
          is_visible: patch.is_visible ?? item.is_visible,
          is_featured: patch.is_featured ?? item.is_featured,
          for_sale: patch.for_sale ?? item.for_sale,
          price_label: item.price_label,
        },
      });
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMoveItem(index: number, direction: -1 | 1) {
    if (!galleryFromDb) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved!);
    setBusy(true);
    try {
      await reorderFn({ data: { orderedIds: copy.map((i) => i.id) } });
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change order.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePhoto(item: GalleryItemData) {
    if (!window.confirm(`Remove "${item.title}" from Made in the Shed?`)) return;
    setBusy(true);
    try {
      await delItemFn({ data: { id: item.id } });
      toast.success(`Removed "${item.title}"`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete photo.");
    } finally {
      setBusy(false);
    }
  }

  const visibleList = selectedCat === "all" ? items : items.filter((i) => i.category_id === selectedCat);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Made in the Shed — Photos &amp; Groups</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add new woodwork or craft photos, rename items, organise them into groups, star favourites for the Home
            page, or mark items as available to buy.
          </p>
        </div>
        {galleryFromDb ? (
          <button
            type="button"
            onClick={openNewPhotoModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add New Photo
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={handleEnableEditing}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-extrabold text-accent-foreground shadow-soft hover:brightness-95 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Unlock Gallery for Editing (loads all 31 existing photos)
          </button>
        )}
      </div>

      {!galleryFromDb && (
        <div className="rounded-2xl border-2 border-accent bg-accent/15 p-4 text-sm font-semibold text-foreground">
          Your 31 existing Shed photos are currently using the built-in defaults. Click{" "}
          <strong>"Unlock Gallery for Editing"</strong> above (one-time setup) to load all 31 photos and 3 groups into
          your live gallery editor so you can rename, add, or reorganise anything.
        </div>
      )}

      {/* Groups (Categories) Manager */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="text-base font-extrabold">Photo Groups (Categories)</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          These are the filter buttons visitors tap on the "Made in the Shed" page. You can rename existing groups or
          add new ones.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            const isEditing = editingCatId === cat.id;
            return (
              <div
                key={cat.id}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      className="w-44 rounded-lg border border-primary bg-card px-2 py-1 text-sm font-bold focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleRenameCategory(cat.id)}
                      className="rounded-lg bg-primary p-1.5 text-primary-foreground"
                      title="Save name"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCatId(null)}
                      className="rounded-lg bg-muted p-1.5 text-muted-foreground"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-bold">{cat.name}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-primary">
                      {count}
                    </span>
                    {galleryFromDb && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.name);
                          }}
                          className="ml-1 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-primary"
                          title="Rename group"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Delete group"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New group name (e.g. Woodcarving, Metalwork, Furniture Repairs)"
            className="min-w-[260px] flex-1 rounded-xl border-2 border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            disabled={busy || !newCatName.trim()}
            onClick={handleAddCategory}
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
          >
            <FolderPlus className="h-4 w-4" /> Add Group
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCat("all")}
          className={cn(
            "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition",
            selectedCat === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-primary",
          )}
        >
          All Photos ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCat(cat.id)}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition",
              selectedCat === cat.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary",
            )}
          >
            {cat.name} ({items.filter((i) => i.category_id === cat.id).length})
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleList.map((item) => {
          const fullIdx = items.findIndex((x) => x.id === item.id);
          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition",
                item.is_visible ? "border-border" : "border-dashed border-muted-foreground/40 opacity-70",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  {item.is_featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-accent-foreground shadow-xs">
                      <Star className="h-3 w-3 fill-current" /> Home Page
                    </span>
                  )}
                  {item.for_sale && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground shadow-xs">
                      <Tag className="h-3 w-3" /> {item.price_label || "Available"}
                    </span>
                  )}
                  {!item.is_visible && (
                    <span className="rounded-full bg-foreground/80 px-2.5 py-0.5 text-xs font-bold text-background">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p className="text-base font-extrabold leading-snug">{item.title}</p>
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                    {item.category_name}
                  </p>
                </div>

                {galleryFromDb && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openEditPhotoModal(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleQuickToggle(item, { is_featured: !item.is_featured })}
                        title={item.is_featured ? "Remove from Home page preview" : "Show on Home page preview"}
                        className={cn(
                          "rounded-lg p-1.5 transition",
                          item.is_featured
                            ? "bg-accent text-accent-foreground"
                            : "bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Star className={cn("h-3.5 w-3.5", item.is_featured && "fill-current")} />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleQuickToggle(item, { is_visible: !item.is_visible })}
                        title={item.is_visible ? "Hide from public website" : "Show on public website"}
                        className="rounded-lg bg-background p-1.5 text-muted-foreground hover:text-foreground"
                      >
                        {item.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {selectedCat === "all" && (
                        <>
                          <button
                            type="button"
                            disabled={busy || fullIdx <= 0}
                            onClick={() => handleMoveItem(fullIdx, -1)}
                            title="Move earlier"
                            className="rounded-lg bg-background p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={busy || fullIdx >= items.length - 1}
                            onClick={() => handleMoveItem(fullIdx, 1)}
                            title="Move later"
                            className="rounded-lg bg-background p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeletePhoto(item)}
                        title="Delete photo"
                        className="rounded-lg bg-background p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Photo Modal */}
      {photoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold">{photoModal.id ? "Edit Shed Photo" : "Add New Shed Photo"}</h3>
              <button
                type="button"
                onClick={() => setPhotoModal(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {photoModal.image_url && (
                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                  <img
                    src={photoModal.image_url}
                    alt={photoModal.title || "Preview"}
                    className="max-h-56 w-full object-contain"
                  />
                </div>
              )}

              <PhotoUploadButton
                folder="gallery"
                label={photoModal.image_url ? "Replace photo with a different picture" : "Choose a photo from your device"}
                onUploaded={(url) => setPhotoModal((prev) => (prev ? { ...prev, image_url: url } : null))}
              />

              <label className="block">
                <span className="mb-1 block text-sm font-bold">What is this item called?</span>
                <input
                  type="text"
                  value={photoModal.title}
                  onChange={(e) => setPhotoModal((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  placeholder="e.g. Hand-carved woodland owl"
                  className="w-full rounded-xl border-2 border-input bg-background px-4 py-2.5 text-base focus:border-primary focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-bold">Which group does it belong in?</span>
                <select
                  value={photoModal.category_id}
                  onChange={(e) => setPhotoModal((prev) => (prev ? { ...prev, category_id: e.target.value } : null))}
                  className="w-full rounded-xl border-2 border-input bg-background px-4 py-2.5 text-base font-semibold focus:border-primary focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2.5 rounded-2xl border border-border bg-background p-4">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <span className="block text-sm font-bold">Show on public website</span>
                    <span className="text-xs text-muted-foreground">Turn off to keep as a hidden draft.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoModal.is_visible}
                    onChange={(e) => setPhotoModal((prev) => (prev ? { ...prev, is_visible: e.target.checked } : null))}
                    className="h-5 w-5 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border pt-2.5">
                  <div>
                    <span className="block text-sm font-bold">Feature on the Home page</span>
                    <span className="text-xs text-muted-foreground">
                      Starred items appear first in the Home page showcase.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoModal.is_featured}
                    onChange={(e) =>
                      setPhotoModal((prev) => (prev ? { ...prev, is_featured: e.target.checked } : null))
                    }
                    className="h-5 w-5 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border pt-2.5">
                  <div>
                    <span className="block text-sm font-bold">Available to buy</span>
                    <span className="text-xs text-muted-foreground">Adds a friendly badge on the photo.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoModal.for_sale}
                    onChange={(e) => setPhotoModal((prev) => (prev ? { ...prev, for_sale: e.target.checked } : null))}
                    className="h-5 w-5 accent-primary"
                  />
                </label>

                {photoModal.for_sale && (
                  <label className="block pt-1">
                    <span className="mb-1 block text-xs font-bold text-muted-foreground">
                      Optional label or suggested donation (e.g. "£15 suggested donation" or leave blank for "Available")
                    </span>
                    <input
                      type="text"
                      value={photoModal.price_label}
                      onChange={(e) =>
                        setPhotoModal((prev) => (prev ? { ...prev, price_label: e.target.value } : null))
                      }
                      placeholder="e.g. £20 suggested donation"
                      className="w-full rounded-xl border-2 border-input bg-card px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPhotoModal(null)}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSavePhoto}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {photoModal.id ? "Save Changes" : "Add Photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
