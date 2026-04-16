import { AppointmentForm } from "@/components/appointments/appointment-form";

interface NewAppointmentPageProps {
  searchParams?: Promise<{
    hospitalId?: string;
    doctorId?: string;
  }>;
}

export default async function NewAppointmentPage({ searchParams }: NewAppointmentPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <AppointmentForm initialHospitalId={params.hospitalId ?? ""} initialDoctorId={params.doctorId ?? ""} />
  );
}
