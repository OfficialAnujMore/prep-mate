import { useEffect, useMemo, useState } from "react";

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
    // availability() is async—wrap in IIFE
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

  const writerStatus = useMemo(() => {
    console.log(`Writer status ${availability}`);
    switch (availability) {
      case "available":
        return {
          label: "AI engine ready",
          tone: "ready" as const,
        };
      case "downloading":
        return {
          label: `Downloading resources`,
          tone: "progress" as const,
        };
      case "downloadable":
        return {
          label: "Preparing AI engine…",
          tone: "progress" as const,
        };
      case "checking":
        return {
          label: "Checking AI engine…",
          tone: "progress" as const,
        };
      case "error":
        return {
          label: "We couldn't initialise the AI engine. Refresh to try again.",
          tone: "warn" as const,
        };
      case "unavailable":
      default:
        return {
          label: "AI engine unavailable in this browser.",
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
