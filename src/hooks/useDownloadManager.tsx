import { useEffect, useMemo, useState } from "react";
import { COPY } from "../constants/copy";

type WriterAvailability =
  | "checking"
  | "unavailable"
  | "available"
  | "downloadable"
  | "downloading"
  | "error";

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
        console.log("Writer.availability() status", a);

        setAvailability(a);
      } catch (err) {
        console.error("Failed to check Writer availability", err);
        setAvailability("unavailable");
      }
    })();
  }, []);

  // TODO: Import the hardcoded label and tone from a constant file
  const writerStatus = useMemo(() => {
    console.log(`Writer status ${availability}`);
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
        console.log("Writer availability status inside onStartDownload");

        // w = await (self as any).Writer.create(options);
        console.log("Writer created with options");
      } else {
        console.log("Writer not available");
        console.log("----Downloading writer----");
        setAvailability("downloading");

        w = await (self as any).Writer.create({
          ...options,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              const pct = Math.round((e.loaded ?? 0) * 100);
              console.log(`Downloaded ${pct}%`);
            });
          },
        });
      }
      const a = await (self as any).Writer.availability();
      console.log("Writer.availability() status", a);

      setAvailability(a);
    } catch (err) {
      setAvailability("error");
      console.error("Failed to create Writer", err);
    }
  };

  return {
    onStartDownload,
    writerStatus,
    availability,
  };
};

export default useDownloadManager;
