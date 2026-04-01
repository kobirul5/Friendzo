import FriendsNetworkBrowser from "@/components/shared/friends-network-browser";

export default function FindFriendsPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f8f2eb_0%,#efe4d8_55%,#e6d9cd_100%)]">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <FriendsNetworkBrowser
          defaultTab="suggestions"
          pageTitle="Find Friends"
          pageDescription="Use the left sidebar buttons to switch between your friends, suggestions, and new requests."
        />
      </div>
    </main>
  );
}
