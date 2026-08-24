import { Dimensions } from "@/components/home/Dimensions";
import { Hero } from "@/components/home/Hero";
import { How } from "@/components/home/How";
import { Institutions } from "@/components/home/Institutions";
import { Why } from "@/components/home/Why";
import { AxonGaps } from "@/components/home/AxonGaps";
import { DecisionUrgency } from "@/components/home/DecisionUrgency";

export default function Home() {
  return (
    <>
      <Hero />
      <AxonGaps />
      <Why />
      <DecisionUrgency />
      <Dimensions />
      <How />
      <Institutions />
    </>
  );
}
