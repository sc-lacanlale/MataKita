import ModeShell from "@/components/ModeShell";
import { getMode } from "@/lib/modes";

export default function OutdoorPage() {
  return <ModeShell mode={getMode("outdoor")} />;
}
