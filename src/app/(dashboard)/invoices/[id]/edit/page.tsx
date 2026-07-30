import InvoiceEditPage from "@/components/invoices/InvoiceEditPage";
 
interface EditProps {
  params: Promise<{ id: string }>;
}
 
export default async function Page({ params }: EditProps) {
  const { id } = await params;
  return <InvoiceEditPage invoiceId={id} />;
}
