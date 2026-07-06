import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type LocationState = {
  from?: string;
};

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from ?? "/";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                Welcome back
              </h1>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Sign in to save your cart, track orders, and manage your PrintForge account. If
                you’re new here, create an account in seconds.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => navigate("/products")}>
                  Browse products
                </Button>
                <Button variant="ghost" onClick={() => navigate("/custom-print")}>
                  Upload design
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <LoginForm />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

