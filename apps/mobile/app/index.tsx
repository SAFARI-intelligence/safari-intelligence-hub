import { Redirect } from "expo-router";
import { useSession } from "../lib/session";

export default function Index() {
  const { isHydrated, accessToken, hasOnboarded } = useSession();

  if (!isHydrated) {
    return null;
  }

  if (!accessToken) {
    return <Redirect href="/auth" />;
  }

  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
