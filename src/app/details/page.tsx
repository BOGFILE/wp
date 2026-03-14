
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, User, Mail, Phone, MapPin, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate navigation/submission
    setTimeout(() => {
      setIsLoading(false);
      alert("Form submitted! Moving to verification...");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-8 bg-accent rounded-full" />
            <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Step 02 / 04</span>
          </div>
          <h1 className="text-4xl font-bold text-primary font-headline mb-4">
            Personal Details
          </h1>
          <p className="text-muted-foreground text-lg">
            Please provide your official identification details to proceed with the account verification process.
          </p>
        </header>

        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-secondary/30">
            <CardTitle className="text-xl font-bold text-primary">Identity Information</CardTitle>
            <CardDescription>All information is encrypted and processed via secure AS-992-SEC protocols.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    First Name
                  </Label>
                  <Input id="firstName" placeholder="e.g. Alexander" className="py-6 border-2 focus-visible:ring-accent" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-bold uppercase tracking-wider">Last Name</Label>
                  <Input id="lastName" placeholder="e.g. Hamilton" className="py-6 border-2 focus-visible:ring-accent" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" />
                  Email Address
                </Label>
                <Input id="email" type="email" placeholder="alex@financial.com" className="py-6 border-2 focus-visible:ring-accent" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  Phone Number
                </Label>
                <Input id="phone" type="tel" placeholder="+41 (0) 00 000 00 00" className="py-6 border-2 focus-visible:ring-accent" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  Physical Address
                </Label>
                <Input id="address" placeholder="Street, Suite, City, Postal Code" className="py-6 border-2 focus-visible:ring-accent" required />
              </div>

              <Separator className="my-8" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => router.push("/")}
                  className="text-primary hover:text-accent font-bold gap-2 px-0 hover:bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Account Type
                </Button>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Button 
                    type="submit"
                    size="lg" 
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? "Processing..." : "Next: Verification"}
                    {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            AccountSelectr Financial Services &bull; Compliance ID: AS-992-SEC
          </p>
        </div>
      </div>
    </div>
  );
}
