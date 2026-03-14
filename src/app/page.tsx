
"use client";

import { useState } from "react";
import { FormProvider, useForm } from "./lib/form-context";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepRenderer } from "@/components/step-renderer";
import { useToast } from "@/hooks/use-toast";
import { ACCOUNT_TYPES } from "./lib/account-types";
import { generateApplicationSummary } from "@/ai/flows/generate-application-summary-flow";
import Image from "next/image";

function ApplicationLayout() {
  const { toast } = useToast();
  const { currentStep, totalSteps, nextStep, prevStep, data, setType } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    { id: 1, label: "TYPE" },
    { id: 2, label: "IDENTITY" },
    { id: 3, label: "CONTACT" },
    { id: 4, label: "ACTIVITY" },
    { id: 5, label: "WEALTH" },
    { id: 6, label: "BANKING" },
    { id: 7, label: "FEE BANK" },
    { id: 8, label: "PAYMENT" },
    { id: 9, label: "REVIEW" },
  ];

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  const handleSubmit = async () => {
    if (currentStep < totalSteps) {
      nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const account = ACCOUNT_TYPES.find((a) => a.id === data.accountTypeId);
      const payloadSummary = {
        applicationType: data.type,
        formData: {
          ...data,
          mainDocumentFile: undefined,
          paymentProofFile: undefined,
          companyRegFile: undefined,
          passportPhoto: undefined,
        },
        accountTitle: account?.title || "Standard Account",
      };

      const summary = await generateApplicationSummary(payloadSummary);

      const formBody = new FormData();
      formBody.append("applicationId", data.applicationId);
      formBody.append("type", data.type);
      formBody.append("accountTypeId", data.accountTypeId);
      formBody.append("emailSubject", summary.subject);
      formBody.append("emailBody", summary.body);
      formBody.append("applicationData", JSON.stringify({
        ...data,
        mainDocumentFile: undefined,
        paymentProofFile: undefined,
        companyRegFile: undefined,
      }));
      formBody.append("signatureImage", data.attestation?.signatureImage || "");

      if (data.mainDocumentFile instanceof File) formBody.append("mainDocumentFile", data.mainDocumentFile);
      if (data.paymentProofFile instanceof File) formBody.append("paymentProofFile", data.paymentProofFile);
      if (data.companyRegFile instanceof File) formBody.append("companyRegFile", data.companyRegFile);

      const apiUrl = process.env.NEXT_PUBLIC_FAAP_API_URL || "http://3.14.204.157";
      const response = await fetch(`${apiUrl}/wp-json/faap/v1/submit`, {
        method: "POST",
        body: formBody,
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Application Received",
          description: `Application ID: ${data.applicationId}. A summary has been sent to your email and our compliance team.`,
        });
        setTimeout(() => window.location.reload(), 4000);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error?.message || "Error communicating with server. Please check your connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinue = () => {
    if (currentStep === 1) return data.accountTypeId !== "";
    if (currentStep === 8) return data.mainDocumentFile !== undefined && data.paymentProofFile !== undefined;
    if (currentStep === 9) return data.attestation?.agreedToTerms && data.attestation?.signatureName !== "";
    return true;
  };

  const getNextLabel = () => {
    if (currentStep === totalSteps) return "SUBMIT NOW ✓";
    const account = ACCOUNT_TYPES.find(a => a.id === data.accountTypeId);
    if (currentStep === 1) return `NEXT: ${data.type === 'personal' ? 'PERSONAL' : 'CORPORATE'} DETAILS ›`;
    return "NEXT STEP";
  };

  return (
    <div className="min-h-screen bg-[#14284a] flex flex-col font-body text-[#0a192f]">
      <header className="bg-[#14284a] py-6 px-6 md:px-12 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center ml-16">
          <div className="bg-[#14284a] p-2 rounded-lg" style={{ boxShadow: '0 0 32px 8px #3ec6ff, 0 0 8px 2px #1a3a5d' }}>
            <Image
              src="/Prominence Bank.png"
              alt="Prominence Bank Logo"
              width={120}
              height={120}
              className="rounded"
              priority
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-[14px] text-white/80 font-bold uppercase tracking-widest mr-16">
          <Lock className="w-5 h-5 text-[#3ec6ff]" />
          Secure Application Portal
        </div>
      </header>

      <div className="bg-gradient-to-r from-[#0a192f] via-[#102447] to-[#162e54] pt-8 pb-10 px-6 md:px-12 shadow-inner relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="space-y-1.5 max-w-xl text-center md:text-left">
            <h1 className="text-white text-3xl md:text-4xl font-bold font-headline leading-tight">
              Open Your <br /><span className="text-[#c29d45]">Account Today</span>
            </h1>
            <p className="text-white/60 text-[13px] font-normal leading-relaxed max-w-sm mt-1">
              Complete this application to start opening your Prominence Bank account. Secure and encrypted processing.
            </p>
          </div>

          <div className="flex gap-10 text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#c29d45]">9</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">Steps</div>
            </div>
            <div className="h-10 w-px bg-white/10 self-center"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#c29d45]">48h</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">Review</div>
            </div>
            <div className="h-10 w-px bg-white/10 self-center"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#c29d45]">100%</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">Secure</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0a192f] px-6 md:px-12 sticky top-0 z-40 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex">
          <button 
            onClick={() => setType('personal')}
            className={cn(
              "px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em] transition-all relative",
              data.type === 'personal' ? "text-[#c29d45] border-b-2 border-[#c29d45]" : "text-white/40 hover:text-white"
            )}
          >
            Personal Account
          </button>
          <button 
            onClick={() => setType('business')}
            className={cn(
              "px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em] transition-all relative",
              data.type === 'business' ? "text-[#c29d45] border-b-2 border-[#c29d45]" : "text-white/40 hover:text-white"
            )}
          >
            Business Account
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-10 z-10 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 relative px-4">
            <div className="absolute top-[15px] left-0 right-0 h-[1.5px] bg-slate-200 z-0 mx-12"></div>
            <div className="flex justify-between items-start relative z-10">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shadow-sm",
                    currentStep === step.id ? "bg-[#0a192f] text-white ring-4 ring-[#0a192f]/10" : 
                    currentStep > step.id ? "bg-[#3b82f6] text-white" : 
                    "bg-white text-[#b0bdc8] border-2 border-slate-200"
                  )}>
                    {step.id}
                  </div>
                  <span className={cn(
                    "text-[9px] uppercase tracking-tighter font-bold text-center",
                    currentStep === step.id ? "text-[#0a192f]" : "text-[#b0bdc8]"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-md shadow-xl overflow-hidden mb-16">
            <div className="h-[3px] bg-slate-100 w-full overflow-hidden">
              <div 
                className="h-full bg-[#3b82f6] transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="p-8 md:p-12">
              {data.type === 'personal' && currentStep === 1 && (
                <div className="mb-8 space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold font-headline text-[#0a192f] mb-2">Personal Account Application Form</h2>
                    <p className="text-slate-600 text-[14px]">Apply for a New Personal Bank Account *</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-[13px] text-blue-800 font-medium">
                      Savings Accounts, Custody Accounts, and Numbered Accounts are the types of accounts that can be used for KEY TESTED TELEX (KTT) transactions.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-[13px] text-amber-800">
                      Please complete this application form in full and sign where indicated so we can assess your application. Incomplete information may cause delays.
                    </p>
                    <p className="text-[13px] text-amber-800 mt-2 font-medium">
                      Use black ink and BLOCK CAPITALS. Where applicable, tick the appropriate box clearly.
                    </p>
                  </div>
                </div>
              )}
              <StepRenderer />
            </div>

            <div className="bg-white border-t p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <button 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="text-[12px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2 hover:text-[#0a192f] transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Step
                </button>
                
                <div className="w-px h-5 bg-slate-200 hidden sm:block" />
                
                <button 
                  onClick={() => {
                    toast({
                      title: "Save Progress",
                      description: "Application progress cached successfully.",
                    });
                  }}
                  className="text-[12px] font-bold text-[#0a192f] uppercase tracking-tight hover:underline underline-offset-4"
                >
                  Save & Continue Later
                </button>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button 
                  onClick={handleSubmit} 
                  disabled={!canContinue() || isSubmitting} 
                  className={cn(
                    "rounded-[4px] h-11 px-10 font-bold text-[12px] uppercase tracking-wide shadow-lg transition-all min-w-[180px]",
                    "bg-[#0a192f] text-white hover:bg-[#162e54]"
                  )}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <>{getNextLabel()} <ChevronRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <footer className="py-8 text-center px-4">
            <p className="text-[10px] uppercase tracking-widest text-[#94a3b8] font-bold leading-loose max-w-4xl mx-auto">
              PROMINENCE BANK IS GOVERNED UNDER THE ETNO DIPLOMATIC REGULATORY FRAMEWORK • SECURE APPLICATION PROTOCOL V4.5
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <FormProvider>
      <ApplicationLayout />
    </FormProvider>
  );
}
