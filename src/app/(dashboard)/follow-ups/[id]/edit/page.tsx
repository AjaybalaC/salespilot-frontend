import { FollowUpEditPage } from "@/components/follow-ups/FollowUpEditPage";
 
interface EditProps {
  params: Promise<{ id: string }>;
}
 
export default async function Page({ params }: EditProps) {
  const { id } = await params;
  return <FollowUpEditPage followUpId={id} />;
}
