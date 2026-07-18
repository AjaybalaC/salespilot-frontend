import CustomerEditPage from "@/components/customers/CustomerEditPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <CustomerEditPage customerId={id} />;
}