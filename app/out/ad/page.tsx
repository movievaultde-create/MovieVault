import { Suspense } from "react";
import OutAdClient from "./OutAdClient";

export default function OutAdPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#07070c] text-white">
          جاري تحميل الإعلان…
        </div>
      }
    >
      <OutAdClient />
    </Suspense>
  );
}
