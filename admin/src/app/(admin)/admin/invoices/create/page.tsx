import { CreateInvoiceForm } from "@/components/admin/create-invoice-form"

export default function CreateInvoicePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record a cash payment or offline order and generate a printable invoice.
        </p>
      </div>
      <CreateInvoiceForm />
    </div>
  )
}
