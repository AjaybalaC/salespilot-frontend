import LeadForm from "@/components/leads/LeadForm";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  return <LeadFormWrapper searchParams={searchParams} />;
}


async function LeadFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  return <LeadForm mode="create" prefillCustomerId={customerId} />;
}