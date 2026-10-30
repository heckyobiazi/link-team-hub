import Image from "next/image";

type LoadingPageProps = {
  label?: string;
  fullScreen?: boolean;
};

export default function LoadingPage({
  label = "Loading…",
  fullScreen = false,
}: LoadingPageProps) {
  return (
    <div
      aria-live="polite"
      className={`grid place-items-center ${fullScreen ? "min-h-dvh" : "min-h-64"}`}
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          alt=""
          className="size-16 animate-pulse"
          height={64}
          src="/link-mark.svg"
          width={64}
        />
        <span className="text-sm text-slate-400">{label}</span>
      </div>
    </div>
  );
}
