"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PERSONAL_STEPS, BUSINESS_STEPS } from "./form-steps";

export type ApplicationType = "personal" | "business";

export type ApplicationData = {
  type: ApplicationType;
  accountTypeId: string;
  applicationId: string;
  attestation: {
    agreedToTerms: boolean;
    signatureName: string;
    signatureDate: string;
    idNumber: string;
    signatureImage?: string;
  };
  [key: string]: any;
};

type FormContextType = {
  currentStep: number;
  totalSteps: number;
  data: ApplicationData;
  steps: any[];
  isLoading: boolean;
  updateData: (newData: Partial<ApplicationData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  setType: (type: ApplicationType) => void;
};

const defaultData: ApplicationData = {
  type: "personal",
  accountTypeId: "",
  applicationId: crypto.randomUUID().substring(0, 8),
  attestation: {
    agreedToTerms: false,
    signatureName: "",
    signatureDate: "",
    idNumber: "",
    signatureImage: "",
  },
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ApplicationData>(defaultData);
  const [steps, setSteps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSteps() {
      setIsLoading(true);
      const defaultSteps = data.type === 'personal' ? PERSONAL_STEPS : BUSINESS_STEPS;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const runtimeApiUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const apiUrl = process.env.NEXT_PUBLIC_FAAP_API_URL || runtimeApiUrl || "http://3.14.204.157";
        const response = await fetch(`${apiUrl.replace(/\/$/, '')}/wp-json/faap/v1/form-config/${data.type}`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Server error ${response.status}: ${text.slice(0, 240)}`);
        }
        const raw = await response.text();
        let config;
        try {
          config = JSON.parse(raw);
        } catch {
          config = null;
        }

        if (Array.isArray(config) && config.length > 0) {
          setSteps(config);
        } else {
          setSteps(defaultSteps);
        }
      } catch (e) {
        setSteps(defaultSteps);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSteps();
  }, [data.type]);

  const totalSteps = 9;

  const updateData = (newData: Partial<ApplicationData>) => {
    setData((prev) => ({
      ...prev,
      ...newData,
      attestation: newData.attestation ? { ...prev.attestation, ...newData.attestation } : prev.attestation
    }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const setStep = (step: number) => setCurrentStep(step);
  const setType = (type: ApplicationType) => {
    setData({ ...defaultData, type, applicationId: crypto.randomUUID().substring(0, 8) });
    setCurrentStep(1);
  };

  return (
    <FormContext.Provider
      value={{
        currentStep,
        totalSteps,
        data,
        steps,
        isLoading,
        updateData,
        nextStep,
        prevStep,
        setStep,
        setType,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
}
