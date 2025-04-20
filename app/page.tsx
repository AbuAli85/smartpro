import ContractForm from "@/components/contract-form"

export default function Page() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Create New Contract</h1>
      <ContractForm />
    </main>
  )
}
