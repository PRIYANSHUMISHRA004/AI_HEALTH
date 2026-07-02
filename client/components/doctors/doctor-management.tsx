"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";

import { DoctorFilters, type DoctorFiltersValue } from "@/components/doctors/doctor-filters";
import { DoctorFormModal, type DoctorFormValues } from "@/components/doctors/doctor-form-modal";
import { DoctorStatsCards } from "@/components/doctors/doctor-stats-cards";
import { DoctorTable, type DoctorWithMeta } from "@/components/doctors/doctor-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { getErrorMessage } from "@/lib/utils";
import { doctorService } from "@/services";
import { useAuth, useToast } from "@/hooks";
import type { Doctor } from "@/types";

const initialFilters: DoctorFiltersValue = {
  search: "",
  specialization: "",
  department: "",
  availability: "",
};

const initialForm: DoctorFormValues = {
  name: "",
  specialization: "",
  department: "",
  experience: "",
  availability: true,
  hospitalId: "",
};

export function DoctorManagement() {
  const { token, user } = useAuth();
  const toast = useToast();
  const hospitalId = user?.linkedHospitalId ?? "";

  const [filters, setFilters] = useState<DoctorFiltersValue>(initialFilters);
  const [page, setPage] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 8, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorFormValues>(initialForm);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.specialization, filters.department, filters.availability]);

  useEffect(() => {
    if (!hospitalId) {
      setDoctors([]);
      setAllDoctors([]);
      setLoadError("Your account is not linked to a hospital yet. Add a hospital ID in your profile to manage doctors.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadDoctors = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [pagedDoctors, hospitalDoctors] = await Promise.all([
          doctorService.list({
            hospitalId,
            search: filters.search || undefined,
            specialization: filters.specialization || undefined,
            department: filters.department || undefined,
            availability: filters.availability || undefined,
            page,
            limit: 8,
            sortBy: "createdAt",
            order: "desc",
          }),
          doctorService.list({
            hospitalId,
            limit: 100,
            sortBy: "name",
            order: "asc",
          }),
        ]);

        if (cancelled) return;

        setDoctors(pagedDoctors.data);
        setPagination(pagedDoctors.pagination);
        setAllDoctors(hospitalDoctors.data);
      } catch (error) {
        if (cancelled) return;
        const message = getErrorMessage(error, "Failed to load doctors.");
        setLoadError(message);
        toast.error("Unable to load doctors", message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadDoctors();

    return () => {
      cancelled = true;
    };
  }, [filters.availability, filters.department, filters.search, filters.specialization, hospitalId, page, refreshKey, token, toast]);

  const displayedDoctors = useMemo<DoctorWithMeta[]>(() => doctors, [doctors]);

  const specializationOptions = useMemo(
    () => Array.from(new Set(allDoctors.map((doctor) => doctor.specialization).filter(Boolean))).sort(),
    [allDoctors],
  );

  const departmentOptions = useMemo(
    () => Array.from(new Set(allDoctors.map((doctor) => doctor.department).filter(Boolean))).sort(),
    [allDoctors],
  );

  const stats = useMemo(() => {
    const totalDoctors = allDoctors.length;
    const availableDoctors = allDoctors.filter((doctor) => doctor.availability).length;
    const departments = new Set(allDoctors.map((doctor) => doctor.department).filter(Boolean)).size;
    const ratedDoctors = allDoctors.filter((doctor) => doctor.averageRating > 0);
    const averageRatingLabel = ratedDoctors.length
      ? (ratedDoctors.reduce((total, doctor) => total + doctor.averageRating, 0) / ratedDoctors.length).toFixed(1)
      : "No ratings yet";

    return {
      totalDoctors,
      availableDoctors,
      departments,
      averageRatingLabel,
    };
  }, [allDoctors]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      hospitalId,
    });
    setEditingDoctorId(null);
    setActionError(null);
  };

  const openCreateModal = () => {
    setModalMode("create");
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setModalMode("edit");
    setEditingDoctorId(doctor._id);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      department: doctor.department,
      experience: String(doctor.experience),
      availability: doctor.availability,
      hospitalId: typeof doctor.hospitalId === "string" ? doctor.hospitalId : doctor.hospitalId?._id ?? hospitalId,
    });
    setActionError(null);
    setModalOpen(true);
  };

  const openViewModal = (doctor: Doctor) => {
    setModalMode("view");
    setEditingDoctorId(doctor._id);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      department: doctor.department,
      experience: String(doctor.experience),
      availability: doctor.availability,
      hospitalId: typeof doctor.hospitalId === "string" ? doctor.hospitalId : doctor.hospitalId?._id ?? hospitalId,
    });
    setActionError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!token) {
      setActionError("You must be signed in to save doctor records.");
      toast.error("Not authenticated", "Please sign in again to continue.");
      return;
    }

    const experience = Number(form.experience);
    if (!form.name.trim() || !form.specialization.trim() || !form.department.trim() || !form.hospitalId.trim()) {
      setActionError("Please complete all required doctor fields.");
      return;
    }
    if (!Number.isFinite(experience) || experience < 0) {
      setActionError("Experience must be a valid number greater than or equal to zero.");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    const resolvedHospitalId = hospitalId || form.hospitalId.trim();

    const payload = {
      hospitalId: resolvedHospitalId,
      name: form.name.trim(),
      specialization: form.specialization.trim(),
      department: form.department.trim(),
      experience,
      availability: form.availability,
    };

    try {
      if (modalMode === "create") {
        await doctorService.create(payload, token);
        toast.success("Doctor added", "The doctor profile was created successfully.");
        setSuccessMessage("Doctor created successfully.");
        setPage(1);
      } else if (editingDoctorId) {
        await doctorService.update(editingDoctorId, payload, token);
        toast.success("Doctor updated", "The doctor profile was updated successfully.");
        setSuccessMessage("Doctor updated successfully.");
      }

      closeModal();
      setRefreshKey((current) => current + 1);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save doctor.");
      setActionError(message);
      toast.error("Doctor action failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!token) {
      toast.error("Not authenticated", "Please sign in again to continue.");
      return;
    }

    if (!window.confirm(`Delete ${doctor.name} from this hospital?`)) {
      return;
    }

    setDeletingId(doctor._id);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await doctorService.remove(doctor._id, token);
      toast.success("Doctor deleted", "The doctor profile was removed.");
      setSuccessMessage("Doctor deleted successfully.");
      if (displayedDoctors.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        setRefreshKey((current) => current + 1);
      }
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete doctor.");
      setActionError(message);
      toast.error("Delete failed", message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-[var(--border)] bg-[linear-gradient(135deg,#0f766e_0%,#134e4a_55%,#10231b_100%)] px-6 py-8 text-white shadow-[0_25px_70px_rgba(15,118,110,0.24)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-100/90">Doctor management</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Manage your hospital medical staff</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-teal-50/86">
              Keep doctor profiles, departments, availability, and appointment readiness in one cleaner hospital workspace.
            </p>
          </div>

          <button type="button" onClick={openCreateModal} className="btn-secondary btn-md self-start border-white/20 bg-white text-[var(--foreground)] hover:bg-teal-50">
            <Plus className="h-4 w-4" />
            Add Doctor
          </button>
        </div>
      </section>

      <DoctorStatsCards
        totalDoctors={stats.totalDoctors}
        availableDoctors={stats.availableDoctors}
        departments={stats.departments}
        averageRatingLabel={stats.averageRatingLabel}
      />

      <DoctorFilters
        value={filters}
        specializationOptions={specializationOptions}
        departmentOptions={departmentOptions}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {successMessage ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {loadError ? (
        <ErrorState
          title="Unable to load doctors"
          description={loadError || "Something went wrong while loading doctor records."}
        />
      ) : null}

      {!loadError && actionError ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {actionError}
        </div>
      ) : null}

      <section className="rounded-[30px] border border-[var(--border)] bg-white/92 shadow-[0_20px_50px_rgba(16,35,27,0.06)]">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Doctor directory</h2>
            <p className="text-sm text-[var(--muted)]">
              {pagination.total} doctors matched to this hospital workspace.
            </p>
            <p className="mt-1 hidden text-xs uppercase tracking-[0.18em] text-[var(--muted)]/80 lg:block">
              Scroll horizontally to view more details
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="btn-secondary btn-sm self-start"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="px-6 py-8">
            <LoadingState
              title="Loading doctors"
              description="Fetching doctor profiles and filters for this hospital workspace."
            />
          </div>
        ) : displayedDoctors.length === 0 ? (
          <div className="px-6 py-8">
            <EmptyState
              title="No doctors found"
              description="Try adjusting the filters or add the first doctor to this hospital workspace."
              action={
                <button type="button" onClick={openCreateModal} className="btn-primary btn-sm">
                  <Plus className="h-4 w-4" />
                  Add Doctor
                </button>
              }
            />
          </div>
        ) : (
          <DoctorTable
            doctors={displayedDoctors}
            deletingId={deletingId}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}

        {pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4 text-sm text-[var(--muted)]">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                className="btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <DoctorFormModal
        mode={modalMode}
        open={modalOpen}
        values={form}
        onChange={setForm}
        onClose={closeModal}
        onSubmit={handleSave}
        isSubmitting={isSubmitting}
        error={actionError}
        hospitalLocked={Boolean(hospitalId)}
      />
    </div>
  );
}
