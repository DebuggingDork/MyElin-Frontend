import { Dimensions } from "@/components/home/Dimensions";
import { Hero } from "@/components/home/Hero";
import { How } from "@/components/home/How";
import { Institutions } from "@/components/home/Institutions";
import { Why } from "@/components/home/Why";

/** The surface these sections were designed against now belongs to the whole site --
 *  `app/(site)/layout.tsx` carries the `ledger` palette and the shared chrome. */
export default function Home() {
  return (
    <>
      <Hero />
      <Why />
      <Dimensions />
      <How />
      <Institutions />
    </>
  );
}
