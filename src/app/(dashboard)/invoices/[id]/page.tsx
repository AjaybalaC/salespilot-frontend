import InvoiceDetail from "@/components/invoices/InvoiceDetail";
 
interface DetailProps {
  params: Promise<{ id: string }>;
}
 
export default async function Page({ params }: DetailProps) {
  const { id } = await params;
  return <InvoiceDetail invoiceId={id} />;
}
