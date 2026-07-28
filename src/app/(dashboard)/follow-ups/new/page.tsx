import FollowUpForm from "@/components/follow-ups/FollowUpForm";
 
interface Props {
  searchParams: Promise<{ leadId?: string }>;
}
 
async function FollowUpNewWrapper({ searchParams }: Props) {
  const { leadId } = await searchParams;
  return <FollowUpForm mode="create" prefillLeadId={leadId} />;
}
 
export default function Page({ searchParams }: Props) {
  return <FollowUpNewWrapper searchParams={searchParams} />;
}
