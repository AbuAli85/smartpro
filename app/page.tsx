import { Header } from "./components/header"
import ContractForm from "./contract-form"

export default function Home() {
  return (
    <main>
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <ContractForm />
      </div>
    </main>
  )
}
