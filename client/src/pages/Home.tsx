import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import { Link } from "wouter";
import { ArrowRight, ShoppingBag, Scissors, Briefcase, Shirt, Store } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const categories = [
    { 
      id: "retail", 
      name: "Retail Shops", 
      icon: ShoppingBag, 
      color: "bg-orange-100 text-orange-600",
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80" 
    },
    { 
      id: "tailor", 
      name: "Tailors", 
      icon: Scissors, 
      color: "bg-blue-100 text-blue-600",
      img: "https://images.unsplash.com/photo-1596906233486-4553b4791336?auto=format&fit=crop&q=80"
    },
    { 
      id: "laundry", 
      name: "Laundry", 
      icon: Shirt, 
      color: "bg-cyan-100 text-cyan-600",
      img: "https://images.unsplash.com/photo-1545173168-9f1947eebb8f?auto=format&fit=crop&q=80"
    },
    { 
      id: "service", 
      name: "Services", 
      icon: Briefcase, 
      color: "bg-purple-100 text-purple-600",
      img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80"
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 px-4">
        {/* Abstract shapes/background */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-display font-bold text-gray-900 leading-[1.1] text-balance"
            >
              Your Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent">Mall</span>, <br />
              <span className="italic font-serif font-medium text-4xl md:text-6xl text-muted-foreground">Digitally Reimagined.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Discover local tailors, laundries, and retail shops. Post tasks for your neighbors or find work. The heart of South African commerce, online.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link href="/shops">
                <Button size="lg" className="rounded-full px-8 h-14 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
                  Browse Shops
                </Button>
              </Link>
              <Link href="/tasks">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-2 hover:bg-gray-50 hover:-translate-y-1 transition-all">
                  Find Tasks
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">Explore Categories</h2>
              <p className="text-muted-foreground">Everything you need, right in your neighborhood.</p>
            </div>
            <Link href="/shops" className="hidden md:flex items-center text-primary font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link key={cat.id} href={`/shops?category=${cat.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 z-10" />
                  
                  {/* Unsplash Category Image */}
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center backdrop-blur-md bg-white/20 text-white group-hover:bg-primary group-hover:scale-110 transition-all duration-500`}>
                      <cat.icon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-white/90 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
                      View shops and place orders
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <Link href="/shops">
              <Button variant="ghost" className="text-primary">View all categories <ArrowRight className="ml-2 w-4 h-4"/></Button>
             </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-secondary text-white relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                Ready to grow your business?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-xl">
                Open your digital storefront today. Whether you're a tailor, laundry service, or retailer, connect with customers in your community instantly.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-secondary-foreground font-semibold px-8 h-12 rounded-full"
                  onClick={() => window.location.href = user ? '/shops' : '/api/login'}
                >
                  Start Selling
                </Button>
                <Link href="/tasks">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/20 hover:bg-white/10 text-white h-12 rounded-full"
                  >
                    Browse Tasks
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Abstract visual */}
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-full opacity-20 blur-3xl animate-pulse"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-700 group cursor-default">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                      <Store size={24} />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-white/30 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-white/20 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-24 bg-white/10 rounded-xl border border-white/10 group-hover:bg-white/15 transition-colors duration-500"></div>
                    <div className="h-4 w-full bg-white/20 rounded"></div>
                    <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
