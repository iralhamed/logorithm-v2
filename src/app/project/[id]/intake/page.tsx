import IntakeForm from "@/components/intake/IntakeForm";
import { saveIntakeAction } from "../actions";

export default async function IntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const action = saveIntakeAction.bind(null, id);

  return (
    <div className="flex flex-1 items-start justify-center">
      <IntakeForm action={action} />
    </div>
  );
}
