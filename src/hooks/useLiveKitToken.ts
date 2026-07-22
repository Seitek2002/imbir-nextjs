"use client";

import { useCallback, useEffect, useState } from "react";

import {
  LiveKitCredentials,
  LiveKitServiceError,
  getLiveKitToken,
} from "@/services/livekit.service";
import axios from "axios";

type LiveKitTokenState = {
  data: LiveKitCredentials | null;
  error: LiveKitServiceError | null;
  isLoading: boolean;
};

export const useLiveKitToken = (consultationId: string) => {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<LiveKitTokenState>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void getLiveKitToken(consultationId, controller.signal)
      .then((data) => {
        if (active) setState({ data, error: null, isLoading: false });
      })
      .catch((error: unknown) => {
        if (!active || axios.isCancel(error)) return;
        const liveKitError =
          error instanceof LiveKitServiceError
            ? error
            : new LiveKitServiceError(
                "Не удалось получить доступ к консультации",
                null,
                "request_failed",
              );
        setState({ data: null, error: liveKitError, isLoading: false });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [consultationId, requestVersion]);

  const retry = useCallback(() => {
    setState({ data: null, error: null, isLoading: true });
    setRequestVersion((version) => version + 1);
  }, []);

  return { ...state, retry };
};
