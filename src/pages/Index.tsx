import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <ServiceRequestForm />
      <Categories />
      <Footer />
    </div>
  );
};

export default Index;
