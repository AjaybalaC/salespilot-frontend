import InvoiceForm from "@/components/invoices/InvoiceForm";
 
interface Props {
  searchParams: Promise<{ customerId?: string; leadId?: string }>;
}
 
async function InvoiceNewWrapper({ searchParams }: Props) {
  const { customerId, leadId } = await searchParams;
  return <InvoiceForm mode="create" prefillCustomerId={customerId} prefillLeadId={leadId} />;
}
 
export default function Page({ searchParams }: Props) {
  return <InvoiceNewWrapper searchParams={searchParams} />;
}
 
