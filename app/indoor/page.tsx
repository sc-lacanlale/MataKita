import ModeShell from "@/components/ModeShell";
import { getMode } from "@/lib/modes";

export default function IndoorPage() {
  return <ModeShell mode={getMode("indoor")} />;
}
