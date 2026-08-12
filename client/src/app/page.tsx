import HeroSection from "@/components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import PopularCategories from "@/components/PopularCategories";
import WhyNeuschool from "@/components/WhyNeuschool";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col w-full bg-background">
      <HeroSection />
      <FeaturedCourses />
      <PopularCategories />
      <WhyNeuschool />
      <Testimonials />
    </main>
  );
}
