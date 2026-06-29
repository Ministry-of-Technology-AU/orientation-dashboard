"use client";

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import confetti from "canvas-confetti";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  Options as ConfettiOptions,
} from "canvas-confetti";
import { cn } from "@/lib/utils";

interface Api {
  fire: (options?: ConfettiOptions) => void;
}

type Props = React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  onInitHandler?: (api: Api) => void;
};

export type ConfettiRef = Api | null;

const ConfettiContext = createContext<Api>({} as Api);

const Confetti = forwardRef<ConfettiRef, Props>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    onInitHandler,
    className,
    ...rest
  } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instanceRef = useRef<any>(null);
  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return;
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else {
        if (instanceRef.current) {
          if (typeof (instanceRef.current as any).reset === "function") {
            (instanceRef.current as any).reset();
          }
          instanceRef.current = null;
        }
      }
    },
    [globalOptions],
  );

  const fire = useCallback(
    (opts = {}) => {
      instanceRef.current?.({ ...options, ...opts });
    },
    [options],
  );

  const api: Api = { fire };

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    onInitHandler?.(api);
    if (!manualstart) {
      fire();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none fixed inset-0 z-[9998] size-full", className)}
      {...rest}
    />
  );
});

Confetti.displayName = "Confetti";

interface ConfettiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  children?: React.ReactNode;
}

function ConfettiButton({ options, globalOptions, children, ...props }: ConfettiButtonProps) {
  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = (event.target as HTMLButtonElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      await confetti({
        ...options,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
      });
    },
    [options],
  );
  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export { Confetti, ConfettiButton, ConfettiContext };
export type { Api as ConfettiApi };
