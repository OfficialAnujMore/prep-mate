import { useEffect, useMemo, useState } from "react";
import { COPY } from "../constants/copy";
import type { WriterAvailability } from "../types";

const useDownloadManager = () => {
  const [availability, setAvailability] =
    useState<WriterAvailability>("unavailable");

  useEffect(() => {
    if (!("Writer" in self)) {
      setAvailability("unavailable");
      return;
    }
    (async () => {
      try {
        const a = await (self as any).Writer.availability();
        setAvailability(a);
      } catch (err) {
        setAvailability("unavailable");
      }
    })();
  }, []);

  // TODO: Import the hardcoded label and tone from a constant file
  const writerStatus = useMemo(() => {
    switch (availability) {
      case "available":
        return {
          label: COPY.downloadManager.availableLabel,
          tone: "ready" as const,
        };
      case "downloading":
        return {
          label: COPY.downloadManager.downloadingLabel,
          tone: "progress" as const,
        };
      case "downloadable":
        return {
          label: COPY.downloadManager.downloadableLabel,
          tone: "progress" as const,
        };
      case "checking":
        return {
          label: COPY.downloadManager.checkingLabel,
          tone: "progress" as const,
        };
      case "error":
        return {
          label: COPY.downloadManager.errorLabel,
          tone: "warn" as const,
        };
      case "unavailable":
      default:
        return {
          label: COPY.downloadManager.defaultLabel,
          tone: "warn" as const,
        };
    }
  }, [availability]);

  const onStartDownload = async () => {
    if (!("Writer" in self)) {
      setAvailability("unavailable");
      return;
    }
    // if (availability === "unavailable" || availability == null) return;

    const options = {
      sharedContext: "AI interview coach for candidate sessions.",
      tone: "formal",
      format: "plain-text",
      length: "medium",
    };

    try {
      let w;
      if (availability === "available") {
        // w = await (self as any).Writer.create(options);
      } else {
        setAvailability("downloading");

        w = await (self as any).Writer.create({
          ...options,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              const pct = Math.round((e.loaded ?? 0) * 100);
            });
          },
        });
      }
      const a = await (self as any).Writer.availability();

      setAvailability(a);
    } catch (err) {
      setAvailability("error");
    }
  };

  return {
    onStartDownload,
    writerStatus,
    availability,
  };
};

export default useDownloadManager;
