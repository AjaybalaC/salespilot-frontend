import TaskForm from "@/components/tasks/TaskForm";
 
interface TaskNewProps {
  searchParams: Promise<{ leadId?: string }>;
}
 
async function TaskNewWrapper({ searchParams }: TaskNewProps) {
  const { leadId } = await searchParams;
  return <TaskForm mode="create" prefillLeadId={leadId} />;
}
 
export default function Page({ searchParams }: TaskNewProps) {
  return <TaskNewWrapper searchParams={searchParams} />;
}
