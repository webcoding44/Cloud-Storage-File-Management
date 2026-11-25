import { getStorageProviders } from "@/services/drive.service";
import { ProviderCard } from "./ProviderCard";

export async function ProvidersSection() {
  const providers = await getStorageProviders();

  return (
    <section aria-label="Connected storage providers" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </section>
  );
}
