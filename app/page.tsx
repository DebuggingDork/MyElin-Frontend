import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Dimensions } from "@/components/home/Dimensions";
import { Hero } from "@/components/home/Hero";
import { How } from "@/components/home/How";
import { Institutions } from "@/components/home/Institutions";
import { Why } from "@/components/home/Why";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Why />
        <Dimensions />
        <How />
        <Institutions />
      </main>
      <Footer />
    </>
  );
}
