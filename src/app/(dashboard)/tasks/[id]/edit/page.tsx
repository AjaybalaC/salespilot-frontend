import { TaskEditPage } from "@/components/tasks/TaskEditPage";
 
interface TaskEditProps {
  params: Promise<{ id: string }>;
}
 
export default async function Page({ params }: TaskEditProps) {
  const { id } = await params;
  return <TaskEditPage taskId={id} />;
}
