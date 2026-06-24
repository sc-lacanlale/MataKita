import ModeShell from "@/components/ModeShell";
import { getMode } from "@/lib/modes";

export default function StudyPage() {
  return <ModeShell mode={getMode("study")} />;
}
