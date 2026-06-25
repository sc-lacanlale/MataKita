import ModeShell from "@/components/ModeShell";
import { getMode } from "@/lib/modes";

export default function SocialPage() {
  return <ModeShell mode={getMode("social")} />;
}
