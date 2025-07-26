import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import FlavorFlow from "@/components/FlavorFlow";

export default function Home() {
  return (
    <div>
      <MaxWidthWrapper>
        <FlavorFlow />
      </MaxWidthWrapper>
    </div>
  );
}
