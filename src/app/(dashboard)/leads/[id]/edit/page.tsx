import LeadEditPage from "@/components/leads/LeadEditPage";
 
interface Props {
  params: Promise<{ id: string }>;
}
 
export default async function Page({ params }: Props) {
  const { id } = await params;
  return <LeadEditPage leadId={id} />;
}