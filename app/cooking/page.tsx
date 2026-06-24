import ModeShell from "@/components/ModeShell";
import { getMode } from "@/lib/modes";

export default function CookingPage() {
  return <ModeShell mode={getMode("cooking")} />;
}
