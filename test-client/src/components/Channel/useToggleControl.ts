import {useEffect, useState} from "react";
import toast from "react-hot-toast";

export function useToggleControl({authoritativeToggled, revision, setToggled}: {
  authoritativeToggled: boolean;
  revision: number;
  setToggled: (toggled: boolean) => Promise<number>;
}) {
  const [draftToggled, setDraftToggled] = useState<boolean | null>(null);
  const [pendingRevision, setPendingRevision] = useState<number | null>(null);
  const displayToggled = draftToggled ?? authoritativeToggled;

  const toggle = async () => {
    const nextToggled = !displayToggled;

    setDraftToggled(nextToggled);

    try {
      const revision = await setToggled(nextToggled);
      setPendingRevision(revision);
    } catch (error) {
      setDraftToggled(null);
      toast.error(error instanceof Error ? error.message : "Could not set toggle");
    }
  }

  useEffect(() => {
    if (pendingRevision !== null && revision >= pendingRevision) {
      setDraftToggled(null);
      setPendingRevision(null);
    }
  }, [revision, pendingRevision]);

  return {
    toggled: displayToggled,
    toggle
  }
}