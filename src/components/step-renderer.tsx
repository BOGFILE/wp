"use client";

import { useForm } from "@/app/lib/form-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Loader2, Upload, FileText, CheckCircle2, ChevronDown, AlertTriangle, Eraser } from "lucide-react";
import { AccountCard } from "./account-card";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPES } from "@/app/lib/account-types";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function StepRenderer() {
  const { currentStep, data, steps, isLoading, updateData } = useForm();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  useEffect(() => {
    if (currentStep === 9 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = "#0a192f";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
      }
    }
  }, [currentStep]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      updateData({ attestation: { ...data.attestation, signatureImage: dataUrl } });
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        updateData({ attestation: { ...data.attestation, signatureImage: "" } });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <Loader2 className="w-10 h-10 animate-spin text-[#c29d45]" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Secure System Synchronization...</p>
      </div>
    );
  }

  // Step 1: Account Selection
  if (currentStep === 1) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-headline text-[#0a192f]">Select Account Type</h2>
          <p className="text-slate-400 text-[13px] font-normal">Choose the account product category for your application.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACCOUNT_TYPES.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              isSelected={data.accountTypeId === account.id}
              onSelect={(id) => updateData({ accountTypeId: id })}
            />
          ))}
        </div>

        <div className="flex items-start gap-3 p-4 bg-[#f0f7ff] rounded-lg border border-[#d0e6ff]">
          <div className="bg-[#0066cc] p-1 rounded-sm shrink-0 mt-0.5">
            <Info className="w-3 h-3 text-white" />
          </div>
          <p className="text-[12px] font-normal leading-relaxed text-[#004080]">
            Savings Accounts, Custody Accounts and Numbered Accounts are approved for KTT transactions. Please consider this application in full using its GLOSSARY.
          </p>
        </div>
      </div>
    );
  }

  // Step 8: Full Payment Instructions & Uploads
  if (currentStep === 8) {
    const isPersonal = data.type === 'personal';
    const appId = data.applicationId;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 font-body">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0a192f] uppercase tracking-tight">ACCOUNT OPENING FEE — PAYMENT INSTRUCTIONS</h2>
          <p className="text-slate-500 text-[12px] italic">Applicable to all new account types listed below.</p>
        </div>

        <div className="space-y-6">
          <div className="pt-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="kyc-note" className="border rounded-lg px-4 bg-blue-50/30">
                <AccordionTrigger className="text-[12px] font-bold uppercase tracking-widest text-[#0a192f] hover:no-underline">
                  KYC/AML DOCUMENTATION NOTE
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-slate-600 leading-relaxed font-normal space-y-2">
                  <p>Please ensure all documents are clear and valid. PCM may assist with intake and document coordination and transmit the compiled package to Prominence Bank. Prominence Bank may request additional documentation or enhanced due diligence at any time. Incomplete or inconsistent information may delay processing or result in the application being declined.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-[#0a192f]">Account Opening Fee (Onboarding & Compliance Processing Fee)</h3>
            <p className="text-[12px] text-slate-600 italic">Payment of the Account Opening Fee does not guarantee approval or account opening.</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px] text-slate-700 list-disc pl-5">
              <li>€25,000 – Euro Account</li>
              <li>$25,000 – USD Account</li>
              <li>€25,000 – Custody Account</li>
              <li>€25,000 – Cryptocurrency Account</li>
              <li>€50,000 – Numbered Account</li>
            </ul>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-[13px] font-bold text-[#0a192f] uppercase tracking-wider">REFUND POLICY (NO EXCEPTIONS)</h3>
            <div className="text-[12px] text-slate-600 leading-relaxed space-y-4 font-normal">
              <p>
                If the application is declined and no account is opened, the Account Opening Fee will be refunded <strong>in full by PCM</strong> (no PCM deductions). Please note that intermediary banks, card processors, or blockchain networks may charge separate fees outside PCM’s control, which can affect the net amount received by the sender. Refunds are issued to the original sender (same payment route) <strong>within ten (10) business days</strong> after the application is formally declined in the Bank’s records.
              </p>
              <p>
                If the application is approved and an account is opened, the Account Opening Fee is deemed fully earned upon account opening and is <strong>non-refundable</strong>, as it covers completed onboarding, administrative coordination, and compliance processing services.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t space-y-6">
            <h3 className="text-[13px] font-bold text-[#0a192f] uppercase tracking-wider">PAYMENT OPTION 1: INTERNATIONAL WIRE (SWIFT)</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-[12px] font-bold text-primary uppercase border-b pb-1 italic">EURO (€) CURRENCY</h4>
                <div className="text-[12px] space-y-2 font-normal text-slate-700">
                  <p><span className="font-bold">Bank Name:</span> Wise Europe</p>
                  <p><span className="font-bold">Bank Address:</span> Rue du Trône 100, 3rd floor. Brussels. 1050. Belgium</p>
                  <p><span className="font-bold">SWIFT Code:</span> TRWIBEB1XXX</p>
                  <p><span className="font-bold">Account Name:</span> PROMINENCE CLIENT MANAGEMENT</p>
                  <p><span className="font-bold">Account Number/IBAN:</span> BE31905717979455</p>
                  <p><span className="font-bold">Account Address:</span> Rue du Trône 100, 3rd floor. Brussels. 1050. Belgium</p>
                  <p className="text-red-600 font-bold bg-red-50 p-2 border border-red-100 mt-2">
                    Payment Reference / Memo (REQUIRED): Application ID: {appId} | Onboarding and Compliance Processing Fee
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[12px] font-bold text-primary uppercase border-b pb-1 italic">USD ($) CURRENCY</h4>
                <div className="text-[12px] space-y-2 font-normal text-slate-700">
                  <p><span className="font-bold">Bank Name:</span> Wise US Inc.</p>
                  <p><span className="font-bold">Bank Address:</span> 108 W 13th St, Wilmington, DE, 19801, United States</p>
                  <p><span className="font-bold">SWIFT Code:</span> TRWIUS35XXX</p>
                  <p><span className="font-bold">Account Name:</span> PROMINENCE CLIENT MANAGEMENT</p>
                  <p><span className="font-bold">Account Number:</span> 205414015428310</p>
                  <p><span className="font-bold">Account Address:</span> 108 W 13th St, Wilmington, DE, 19801, United States</p>
                  <p className="text-red-600 font-bold bg-red-50 p-2 border border-red-100 mt-2">
                    Payment Reference / Memo (REQUIRED): Application ID: {appId} | Onboarding and Compliance Processing Fee
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t space-y-6">
            <h3 className="text-[13px] font-bold text-[#0a192f] uppercase tracking-wider">PAYMENT OPTION 2: CRYPTOCURRENCY (USDT TRC20)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">USDT Wallet Address (TRC20):</span>
                <div className="bg-slate-100 border-2 border-dashed p-4 rounded text-[14px] font-mono break-all text-center select-all font-bold">
                  TPYjSzK3BbZRZAVhBoRZcdyzKpQ9NN6S6Y
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-[12px] font-bold text-[#0a192f] uppercase italic">CRYPTOCURRENCY PAYMENT CONTROLS (USDT TRC20)</h4>
                <p className="text-[12px] text-slate-600 leading-relaxed font-normal">
                  Crypto is accepted solely as a payment method for the Account Opening Fee. PCM does not provide any virtual‑asset exchange, brokerage, custody, wallet custody, or transfer service. To validate a crypto payment, you must provide (i) TXID/transaction hash, (ii) amount sent, (iii) sending wallet address, and (iv) timestamp and supporting screenshot (if available). Refunds (if due) are issued only to the originating wallet address after verification.
                </p>
              </div>

              <div className="p-4 bg-red-50 border border-red-100 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-bold text-[12px]">
                  <AlertTriangle className="w-4 h-4" />
                  IMPORTANT NOTICE:
                </div>
                <p className="text-[12px] text-red-600 font-bold">
                  The Account Opening Fee must be paid via SWIFT international wire (Option 1), or USDT (Option 2).<br />
                  KTT / Telex are not accepted for this initial payment and will not be used to activate an account.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="third-party" className="border rounded-lg px-4 bg-slate-50/50">
                <AccordionTrigger className="text-[12px] font-bold uppercase tracking-widest text-[#0a192f] hover:no-underline">
                  THIRD-PARTY ONBOARDING AND PAYMENT NOTICE
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-slate-600 leading-relaxed font-normal space-y-3">
                  <p>This application may be supported by Prominence Client Management / Prominence Account Management (“PCM”), a separate legal entity acting as an independent introducer and providing administrative onboarding coordination only (intake support, document collection coordination, and application‑package transmission).</p>
                  <p>PCM is not authorized to bind Prominence Bank or make representations regarding approval. PCM is not a bank and does not provide banking, deposit‑taking, securities brokerage, investment advisory, fiduciary, custody, wallet custody, or legal services.</p>
                  <div className="bg-slate-100 p-3 rounded space-y-2">
                    <p className="font-bold">SCOPE OF PCM SERVICES</p>
                    <p>PCM services are limited to (i) assisting with completion of intake forms, (ii) coordinating collection of required documents, (iii) basic completeness checks (format/legibility), and (iv) transmitting the compiled application package to Prominence Bank.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="pt-8 space-y-8 border-t">
            {!isPersonal && (
              <div className="space-y-3">
                <Label className="text-[12px] font-bold uppercase tracking-widest text-[#0a192f]">
                  Insert Full Color Copy of Company Registration Certificate <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <Input type="file" className="h-24 opacity-0 absolute inset-0 z-10 cursor-pointer" onChange={(e) => updateData({ companyRegFile: e.target.files?.[0] })} />
                  <div className="h-24 border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 bg-white group-hover:bg-slate-50 transition-all shadow-sm">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-[11px] font-normal text-slate-500">{data.companyRegFile ? `${data.companyRegFile.name || 'Certificate uploaded ✓'}` : "Click to select or drag and drop (JPG, PNG, PDF)"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-[12px] font-bold uppercase tracking-widest text-[#0a192f]">
                Insert Full Color Photo of your Passport Here <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Input type="file" className="h-24 opacity-0 absolute inset-0 z-10 cursor-pointer" onChange={(e) => updateData({ mainDocumentFile: e.target.files?.[0] })} />
                <div className="h-24 border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 bg-white group-hover:bg-slate-50 transition-all shadow-sm">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-[11px] font-normal text-slate-500">{data.mainDocumentFile ? `${data.mainDocumentFile.name || 'Passport photo selected ✓'}` : "Click to select or drag and drop (JPG, PNG, PDF)"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[12px] font-bold uppercase tracking-widest text-[#0a192f]">
                Insert Full Color Photo of your Offshore Account Opening Fees Payment <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Input type="file" className="h-24 opacity-0 absolute inset-0 z-10 cursor-pointer" onChange={(e) => updateData({ paymentProofFile: e.target.files?.[0] })} />
                <div className="h-24 border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 bg-white group-hover:bg-slate-50 transition-all shadow-sm">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-[11px] font-normal text-slate-500">{data.paymentProofFile ? `${data.paymentProofFile.name || 'Receipt uploaded successfully ✓'}` : "Upload Transfer Receipt or Screenshot (JPG, PNG, PDF)"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 9: Agreed and Attested / Review
  if (currentStep === 9) {
    const isPersonal = data.type === 'personal';
    return (
      <div className="space-y-8 animate-in fade-in duration-500 font-body">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-headline text-[#0a192f]">Agreed and Attested</h2>
          <p className="text-slate-400 text-[13px] font-normal">Please review the mandatory legal framework before final submission.</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 max-h-[400px] overflow-y-auto text-[11px] leading-relaxed text-slate-600 space-y-6 scrollbar-hide shadow-inner">
            <p className="font-bold">By signing and submitting this Business Bank Account Application, the Applicant(s) acknowledge(s), confirm(s), attest(s), represent(s), warrant(s), and irrevocably agree(s) to the following:</p>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">A. Mandatory Submission Requirements (Strict Compliance)</h4>
              <p className="font-normal">The Applicant(s) understand(s), acknowledge(s), and accept(s) that the Bank shall automatically reject, without substantive review, processing, or response, any application submitted without all mandatory items required by the Bank, including, without limitation:</p>
              <ul className="pl-4 list-disc text-[11px] text-slate-600 space-y-1">
                <li>Full Business Bank Account opening fee</li>
                <li>Valid proof of payment</li>
                <li>All required documentation, disclosures, and supporting materials specified in the application form</li>
              </ul>
              <p className="font-normal">The Applicant(s) further acknowledge(s) that repeated submission of incomplete, deficient, inaccurate, or non-compliant applications may, at the Bank’s sole and absolute discretion, result in permanent disqualification from reapplying for any banking product or service.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">B. Payment Instructions (Opening Fee)</h4>
              <p className="font-normal">The Applicant(s) acknowledge(s), understand(s), and accept(s) that payments made via KTT/TELEX are strictly prohibited and shall not be accepted under any circumstances for payment of the bank account opening fee.</p>
              <p className="font-normal">Accepted methods of payment for the opening fee are strictly limited to the following:</p>
              <ul className="pl-4 list-disc text-[11px] text-slate-600 space-y-1">
                <li>SWIFT international wire transfer</li>
                <li>Cryptocurrency transfer to the designated wallet address listed in the application form</li>
              </ul>
              <p className="font-normal">The Applicant(s) further acknowledge(s) that the Application ID must be included in the payment reference field exactly as instructed by the Bank in order to ensure proper and timely allocation of funds. Incomplete, inaccurate, omitted, misdirected, or improperly referenced payments may delay processing and may result in rejection of the application, without liability to the Bank.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">C. Account Opening Requirements</h4>
              <p className="font-normal">The Applicant(s) acknowledge(s), understand(s), and accept(s) that: A minimum balance of USD/EUR 5,000 must be maintained in the account at all times; ongoing adherence to the Bank’s account policies, procedures, operational requirements, and compliance standards is required; and if the account balance falls below the minimum required level, the Bank may restrict services, request corrective funding, apply internal controls, and/or place the account under review until the deficiency is remedied.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">D. Finality of Account Type Selection; No Conversion or Reclassification After Opening</h4>
              <p className="font-normal">The Applicant(s) hereby acknowledge(s), confirm(s), represent(s), warrant(s), and irrevocably agree(s) that the account category selected in this Application is final and may not thereafter be amended, converted, substituted, re-designated, reclassified, exchanged, or otherwise modified into any other account type, whether in whole or in part. Any subsequent request for a different account type requires a new application and full onboarding review.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">E. Transaction Profile and Ongoing Due Diligence</h4>
              <p className="font-normal">The Applicant(s) acknowledge(s) that account activity must align with the declared transaction profile and that material deviations may require additional verification, delay, restriction, or enhanced due diligence. The Applicant(s) agree(s) to provide additional documentation or clarifications when requested.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">F. Accuracy and Authorization</h4>
              <p className="font-normal">The Applicant(s) affirm(s) that all information provided is true, accurate, complete, current, and not misleading, and authorize(s) the Bank to verify details, perform compliance checks, and collect applicable costs as permitted.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">G. Account Retention, Record-Keeping, and Banking Relationship (ETMO Framework)</h4>
              <p className="font-normal">Account closure and retention are governed by the Bank’s internal compliance and legal framework, including ETMO governance. Accounts may be retained in administrative status for record retention and regulatory reasons.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">H. Compliance and Regulatory Framework</h4>
              <p className="font-normal">The Applicant(s) agree(s) to comply with all onboarding and ongoing AML/KYC, sanctions, and risk requirements, and acknowledges that the Bank operates under a sovereign diplomatic framework and international compliance standards.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">I. Data Processing and Privacy</h4>
              <p className="font-normal">The Applicant(s) consent(s) to data processing for application evaluation, onboarding, and compliance as described, including storage and transfer to authorized processors.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-primary uppercase tracking-tight">J. Additional Standard Banking Provisions</h4>
              <p className="font-normal">The Bank reserves the right to restrict, suspend, terminate, or refuse services in accordance with internal policies and regulatory requirements. The Applicant(s) acknowledge(s) that this is a binding part of the application.</p>
            </section>

            <section className="space-y-2">
               <h4 className="font-bold text-primary uppercase tracking-tight">16. Waiver of Claims based on Misunderstanding</h4>
               <p className="font-normal">The Applicant(s) confirm(s) that they have carefully read and understood this Application and are not relying upon any representation other than those expressly set forth by the Bank in writing.</p>
            </section>
          </div>
          
          <div className="bg-[#fff9e6] border border-[#fde68a] p-6 rounded-lg">
             <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  id="attest" 
                  className="mt-1 w-4 h-4 accent-[#0a192f] shrink-0"
                  checked={data.attestation?.agreedToTerms} 
                  onChange={(e) => updateData({attestation: { ...data.attestation, agreedToTerms: e.target.checked}})} 
                />
                <Label htmlFor="attest" className="text-[12px] font-bold leading-relaxed text-[#856404] cursor-pointer">
                  I confirm that I have read and agree to the “AGREED AND ATTESTED” section, including the payment/refund terms and the Bank’s account retention and record-keeping provisions.
                </Label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-primary">{isPersonal ? 'Full Name / Signature Name' : 'Name & Title'} *</Label>
              <Input 
                value={data.attestation?.signatureName} 
                onChange={(e) => updateData({attestation: { ...data.attestation, signatureName: e.target.value}})}
                placeholder={isPersonal ? "Type your official name" : "Name & Corporate Title"}
                className="h-12 rounded-sm font-normal bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-primary">ID Number (Passport/ID) *</Label>
              <Input 
                value={data.attestation?.idNumber} 
                onChange={(e) => updateData({attestation: { ...data.attestation, idNumber: e.target.value}})}
                placeholder="Enter document number"
                className="h-12 rounded-sm font-normal bg-white"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-primary">Signature Date *</Label>
              <Input 
                type="date"
                value={data.attestation?.signatureDate} 
                onChange={(e) => updateData({attestation: { ...data.attestation, signatureDate: e.target.value}})}
                className="h-12 rounded-sm font-normal bg-white"
              />
            </div>
          </div>

          {/* Drawing Signature Section */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-primary">Signature Pad (Draw your signature below) *</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSignature}
                className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Eraser className="w-3 h-3 mr-1" /> Clear Pad
              </Button>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-lg bg-white overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[200px] cursor-crosshair touch-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">Please draw your signature using your mouse or touch screen. This will be stored as an encrypted proof of attestation.</p>
          </div>

          {!isPersonal && (
            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
               <p className="text-[10px] font-bold text-primary uppercase tracking-wider">⚠️ IMPORTANT NOTICE – INCOMPLETE OR NON-COMPLIANT BUSINESS ACCOUNT APPLICATIONS WILL BE REJECTED</p>
               <div className="space-y-2">
                <p className="text-[11px] font-bold text-primary">Why Choose Prominence Bank for Your Business?</p>
                <ul className="text-[10px] text-slate-500 list-disc pl-5 space-y-1">
                  <li>Secure, multi-currency banking solutions</li>
                  <li>Dedicated relationship management</li>
                  <li>Confidential and compliant offshore banking services</li>
                  <li>Global access to funds and financial tools tailored to your operations</li>
                </ul>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dynamic Steps (Steps 2-7)
  const activeStep = steps.find((s: any) => s.order === currentStep);

  if (!activeStep) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-400 italic text-sm font-normal">Configuring secure form segment...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 font-body">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-headline text-[#0a192f] uppercase tracking-tight">{activeStep.title}</h2>
        <p className="text-slate-400 text-[13px] font-normal">{activeStep.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {activeStep.fields?.map((field: any) => {
          const value = (data as any)[field.name] || "";
          return (
            <div key={field.id} className={cn(field.width === "full" ? "md:col-span-2" : "md:col-span-1", "space-y-2")}>
              <Label className="text-[11px] font-bold uppercase tracking-widest text-[#0a192f]">
                {field.label} {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </Label>
              {field.type === "textarea" ? (
                <Textarea 
                  value={value} 
                  placeholder={field.placeholder}
                  onChange={(e) => updateData({ [field.name]: e.target.value })} 
                  className="rounded-sm border-slate-200 text-[14px] font-normal bg-white focus:ring-1 focus:ring-[#c29d45]" 
                />
              ) : field.type === "file" ? (
                <div className="relative group">
                  <Input 
                    type="file" 
                    className="h-24 opacity-0 absolute inset-0 z-10 cursor-pointer" 
                    onChange={(e) => updateData({ [field.name]: e.target.files?.[0] || null })} 
                  />
                  <div className="h-24 border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 bg-white group-hover:bg-slate-50 transition-all shadow-sm">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-[11px] font-normal text-slate-500">{value ? "File selected ✓" : "Click to select or drag and drop (JPG, PNG, PDF)"}</span>
                  </div>
                </div>
              ) : field.type === "radio" ? (
                <div className="space-y-2">
                  {field.options?.map((option: string) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name={field.name} 
                        value={option} 
                        checked={value === option} 
                        onChange={(e) => updateData({ [field.name]: e.target.value })} 
                        className="w-4 h-4 accent-[#0a192f]" 
                      />
                      <span className="text-[14px] font-normal">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <Input 
                  type={field.type} 
                  value={value} 
                  placeholder={field.placeholder}
                  onChange={(e) => updateData({ [field.name]: e.target.value })} 
                  className="h-12 rounded-sm border-slate-200 text-[14px] font-normal bg-white focus:ring-1 focus:ring-[#c29d45]" 
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
