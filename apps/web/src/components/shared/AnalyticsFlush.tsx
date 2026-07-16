"use client";

import { useEffect } from "react";
import { flushEventos } from "@ipet/core/services/analytics";

/** Descarrega a fila de eventos pendentes (sessão anterior/offline) no boot. */
export function AnalyticsFlush() {
  useEffect(() => {
    void flushEventos();
  }, []);
  return null;
}
