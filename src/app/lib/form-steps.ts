
export type FormField = {
  id: string;
  label: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "radio" | "textarea" | "email" | "file";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  width?: "full" | "half";
};

export type FormStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  fields: FormField[];
};

export const PERSONAL_STEPS: FormStep[] = [
  {
    id: "p2",
    order: 2,
    title: "IDENTITY",
    description: "Your Personal details:",
    fields: [
      { id: "f1", label: "Place of birth *", name: "pob", type: "text", width: "half", required: true },
      { id: "f2", label: "First name *", name: "firstName", type: "text", width: "half", required: true },
      { id: "f3", label: "Last name *", name: "lastName", type: "text", width: "half", required: true },
      { id: "f4", label: "Middle name", name: "middleName", type: "text", width: "half" },
      { id: "f5", label: "Date of birth *", name: "dob", type: "date", width: "half", required: true },
      { id: "f6", label: "Nationality *", name: "nationality", type: "text", width: "half", required: true },
      { id: "f7", label: "Passport/ID No. *", name: "passportNo", type: "text", width: "half", required: true },
      { id: "f8", label: "Passport/ID date of issue *", name: "passportIssue", type: "date", width: "half", required: true },
      { id: "f9", label: "Passport/ID Expiration date *", name: "passportExpiry", type: "date", width: "half", required: true },
      { id: "f10", label: "Country of issue *", name: "passportCountry", type: "text", width: "half", required: true },
      { id: "f11", label: "Telephone No.", name: "phone", type: "text", width: "half" },
      { id: "f12", label: "Fax No.", name: "fax", type: "text", width: "half" },
    ]
  },
  {
    id: "p3",
    order: 3,
    title: "CONTACT",
    description: "",
    fields: [
      { id: "f13", label: "Home address *", name: "address", type: "text", width: "full", required: true },
      { id: "f14", label: "Home address line 2", name: "address2", type: "text", width: "full" },
      { id: "f15", label: "City", name: "city", type: "text", width: "half" },
      { id: "f16", label: "State", name: "state", type: "text", width: "half" },
      { id: "f17", label: "Zip code", name: "zip", type: "text", width: "half" },
      { id: "f18", label: "Country *", name: "country", type: "text", width: "half", required: true },
      { id: "f19", label: "Email address *", name: "email", type: "email", width: "half", required: true },
      { id: "f20", label: "Confirm email address *", name: "emailConfirm", type: "email", width: "half", required: true },
      { id: "f21", label: "Mobile No. *", name: "mobile", type: "text", width: "half", required: true },
    ]
  },
  {
    id: "p4",
    order: 4,
    title: "ACTIVITY",
    description: "Expected transfer activity:",
    fields: [
      { id: "f22", label: "Main countries to which you will make transfers:", name: "countriesTo", type: "text", width: "full" },
      { id: "f23", label: "Main countries from which you will receive transfers", name: "countriesFrom", type: "text", width: "full" },
      { id: "f24", label: "Estimated number of outgoing transfers per month", name: "outgoingCount", type: "number", width: "half" },
      { id: "f25", label: "Estimated number of incoming transfers per month", name: "incomingCount", type: "number", width: "half" },
      { id: "f26", label: "Average value for each transfer", name: "avgValue", type: "text", width: "half" },
      { id: "f27", label: "Maximum value of each transfer", name: "maxValue", type: "text", width: "half" },
      { id: "f28", label: "Currency of initial funding", name: "fundingCurrency", type: "text", width: "half" },
    ]
  },
  {
    id: "p5",
    order: 5,
    title: "WEALTH",
    description: "Source of initial funding:",
    fields: [
      { id: "f29", label: "Value of Initial Funding", name: "fundingValue", type: "text", width: "half" },
      { id: "f30", label: "Originating Bank Name", name: "fundingBank", type: "text", width: "half" },
      { id: "f31", label: "Originating Bank Address", name: "fundingBankAddr", type: "text", width: "full" },
      { id: "f32", label: "Account Name", name: "fundingAccName", type: "text", width: "half" },
      { id: "f33", label: "Account Number", name: "fundingAccNo", type: "text", width: "half" },
      { id: "f34", label: "Signatory Full Name", name: "fundingSignatory", type: "text", width: "half" },
      { id: "f35", label: "Describe precisely how these funds were generated", name: "wealthSource", type: "textarea", width: "full" },
    ]
  },
  {
    id: "p6",
    order: 6,
    title: "BANKING",
    description: "Bank Account:",
    fields: [
      { id: "f36", label: "Account currency *", name: "accCurrency", type: "text", width: "half", required: true },
      { id: "f37", label: "Enter an account name for your reference (optional ):", name: "accRef", type: "text", width: "half" },
    ]
  },
  {
    id: "p7",
    order: 7,
    title: "FEE BANK",
    description: "Referral: Recommended by Information on the bank account from which the fee is being paid (if applicable).",
    fields: [
      { id: "f38", label: "Recommended by", name: "referral", type: "text", width: "full" },
      { id: "f39", label: "Bank Name", name: "feeBank", type: "text", width: "half" },
      { id: "f40", label: "Bank Address", name: "feeBankAddr", type: "text", width: "half" },
      { id: "f41", label: "Bank Swift Code", name: "feeSwift", type: "text", width: "half" },
      { id: "f42", label: "Account Holder Name", name: "feeAccHolder", type: "text", width: "half" },
      { id: "f43", label: "Account Number", name: "feeAccNo", type: "text", width: "half" },
      { id: "f44", label: "Account Signatory Name", name: "feeSignatory", type: "text", width: "half" },
      { id: "f45", label: "Describe the Origin of Deposit Funds", name: "feeOrigin", type: "textarea", width: "full" },
    ]
  },
  {
    id: "p8",
    order: 8,
    title: "PAYMENT",
    description: `KYC/AML DOCUMENTATION NOTE
Click to expand / view terms

ACCOUNT OPENING FEE — PAYMENT INSTRUCTIONS
Applicable to all new account types listed below.

Account Opening Fee (Onboarding & Compliance Processing Fee)

Payment of the Account Opening Fee does not guarantee approval or account opening.

€25,000 – Euro Account
$25,000 – USD Account
€25,000 – Custody Account
€25,000 – Cryptocurrency Account
€50,000 – Numbered Account

REFUND POLICY (NO EXCEPTIONS)

If the application is declined and no account is opened, the Account Opening Fee will be refunded in full by PCM (no PCM deductions). Please note that intermediary banks, card processors, or blockchain networks may charge separate fees outside PCM's control, which can affect the net amount received by the sender. Refunds are issued to the original sender (same payment route) within ten (10) business days after the application is formally declined in the Bank's records.

If the application is approved and an account is opened, the Account Opening Fee is deemed fully earned upon account opening and is non-refundable, as it covers completed onboarding, administrative coordination, and compliance processing services.

PAYMENT OPTION 1: INTERNATIONAL WIRE (SWIFT)

EURO (€) CURRENCY

Bank Name: Wise Europe
Bank Address: Rue du Trône 100, 3rd floor. Brussels. 1050. Belgium
SWIFT Code: TRWIBEB1XXX
Account Name: PROMINENCE CLIENT MANAGEMENT
Account Number/IBAN: BE31905717979455
Account Address: Rue du Trône 100, 3rd floor. Brussels. 1050. Belgium
Payment Reference / Memo (REQUIRED): Application ID: 69b50b11 | Onboarding and Compliance Processing Fee

USD ($) CURRENCY

Bank Name: Wise US Inc.
Bank Address: 108 W 13th St, Wilmington, DE, 19801, United States
SWIFT Code: TRWIUS35XXX
Account Name: PROMINENCE CLIENT MANAGEMENT
Account Number: 205414015428310
Account Address: 108 W 13th St, Wilmington, DE, 19801, United States
Payment Reference / Memo (REQUIRED): Application ID: 69b50b11 | Onboarding and Compliance Processing Fee

PAYMENT OPTION 2: CRYPTOCURRENCY (USDT TRC20)

USDT Wallet Address (TRC20): TPYjSzK3BbZRZAVhBoRZcdyzKpQ9NN6S6Y

CRYPTOCURRENCY PAYMENT CONTROLS (USDT TRC20)

Crypto is accepted solely as a payment method for the Account Opening Fee. PCM does not provide any virtual‑asset exchange, brokerage, custody, wallet custody, or transfer service. To validate a crypto payment, you must provide (i) TXID/transaction hash, (ii) amount sent, (iii) sending wallet address, and (iv) timestamp and supporting screenshot (if available). Refunds (if due) are issued only to the originating wallet address after verification.

⚠️ IMPORTANT NOTICE:
The Account Opening Fee must be paid via SWIFT international wire (Option 1), or USDT (Option 2).
KTT / Telex are not accepted for this initial payment and will not be used to activate an account.

THIRD-PARTY ONBOARDING AND PAYMENT NOTICE
Click to expand / view terms`,
    fields: [
      { id: "f46", label: "Insert Full Color Photo of your Passport Here *", name: "passportPhoto", type: "file", width: "full", required: true },
      { id: "f47", label: "Insert Full Color Photo of your Offshore Account Opening Fees Payment *", name: "paymentProof", type: "file", width: "full", required: true },
    ]
  },
  {
    id: "p9",
    order: 9,
    title: "REVIEW",
    description: `AGREED AND ATTESTED
Details
By signing and submitting this Personal Bank Account Application, the Applicant(s) acknowledge(s), confirm(s), attest(s), represent(s), warrant(s), and irrevocably agree(s) to the following:

A. Mandatory Submission Requirements (Strict Compliance)

The Applicant(s) understand(s), acknowledge(s), and accept(s) that the Bank shall automatically reject, without substantive review, processing, or response, any application submitted without all mandatory items required by the Bank, including, without limitation:

• Full Personal Bank Account opening fee

• Valid proof of payment

• All required documentation, disclosures, and supporting materials specified in the application form

The Applicant(s) further acknowledge(s) that repeated submission of incomplete, deficient, inaccurate, or non-compliant applications may, at the Bank's sole and absolute discretion, result in permanent disqualification from reapplying for any banking product or service.

B. Payment Instructions (Opening Fee)

The Applicant(s) acknowledge(s), understand(s), and accept(s) that payments made via KTT/TELEX are strictly prohibited and shall not be accepted under any circumstances for payment of the bank account opening fee.

Accepted methods of payment for the opening fee are strictly limited to the following:

• SWIFT international wire transfer

• Cryptocurrency transfer to the designated wallet address listed in the application form

The Applicant(s) further acknowledge(s) that the Application ID must be included in the payment reference field exactly as instructed by the Bank in order to ensure proper and timely allocation of funds. Incomplete, inaccurate, omitted, misdirected, or improperly referenced payments may delay processing and may result in rejection of the application, without liability to the Bank.

C. Account Opening Requirements

The Applicant(s) acknowledge(s), understand(s), and accept(s) that:

• A minimum balance of USD/EUR 5,000 must be maintained in the account at all times.

• Ongoing adherence to the Bank's account policies, procedures, operational requirements, and compliance standards is required in order to maintain access to banking services.

• If the account balance falls below the minimum required level, the Bank may, in its sole discretion, restrict services, request corrective funding, apply internal controls, and/or place the account under compliance, risk, or administrative review until such deficiency has been remedied to the Bank's satisfaction.

D. Finality of Account Type Selection; No Conversion or Reclassification After Opening

The Applicant(s) hereby acknowledge(s), confirm(s), represent(s), warrant(s), and irrevocably agree(s) that the account category selected in this Application is made solely at the Applicant’s own election, responsibility, and risk, and shall be deemed final for purposes of the submitted Application.

The Applicant(s) further acknowledge(s) and accept(s) that, once the Application has been submitted, approved by the Bank, and the account has been opened, activated, or established under the selected account category, such account category shall be final and may not thereafter be amended, converted, substituted, re-designated, reclassified, exchanged, or otherwise modified into any other account type, whether in whole or in part.

Without limitation, this restriction applies to any selection made by the Applicant, including, but not limited to, a Savings Account, Numbered Account, Cryptocurrency Account, Custody Account, or any other account class, structure, or product designation offered by the Bank from time to time. By way of example only, if an Applicant applies for and opens a Custody Account but later asserts that a Savings Account was intended, the Bank shall have no obligation and shall not be required to convert, redesignate, substitute, or otherwise treat such Custody Account as a Savings Account. The same principle shall apply equally to every other account category.

The Applicant(s) expressly acknowledge(s) that any error, misunderstanding, misinterpretation, oversight, administrative mistake, incorrect selection, or unintended election of account type made by the Applicant, whether arising before submission or discovered after account opening, shall remain solely the responsibility of the Applicant and shall not create any duty, liability, or obligation on the part of the Bank to alter, correct, or reclassify the account category after approval and opening.

Should the Applicant(s) subsequently wish(es) to obtain a different account type from the one originally selected and opened, the Applicant(s) must submit a new and separate application for the desired account category, together with all required forms, supporting documentation, due diligence information, compliance disclosures, and applicable fees then in force. Any such new application shall be subject to the Bank’s full onboarding, underwriting, compliance, risk, and approval procedures, and shall remain at all times subject to the Bank’s sole and absolute discretion.

E. Transaction Profile and Ongoing Due Diligence

The Applicant(s) acknowledge(s) and accept(s) that:

• Account activity must at all times reasonably align with the information declared in this application, including, without limitation, source of funds, source of wealth, countries involved, anticipated transactional activity, expected transaction volumes, and maximum transfer values.

• Any material deviation, inconsistency, anomaly, or change in activity profile may require additional verification and may, for compliance, security, legal, reputational, or operational reasons, be delayed, restricted, reviewed, declined, or otherwise subject to enhanced due diligence.

• The Applicant(s) agree(s) to provide such additional documentation, declarations, evidence, or clarifications as the Bank may request at any time in order to satisfy initial and ongoing AML/KYC, sanctions, fraud prevention, and internal risk-management requirements.

F. Accuracy and Authorization

The Applicant(s) hereby affirm(s), represent(s), warrant(s), and undertake(s) that:

• All information provided in this application is true, accurate, complete, current, and not misleading in any respect.

• The information is submitted for the purpose of establishing a service relationship with Prominence Bank ("the Bank") under the Terms and Conditions disclosed prior to submission and accepted by the Applicant(s) upon signature and/or submission of this Application.

The Applicant(s) hereby authorize(s) the Bank, without further notice except where required by applicable law or the Bank's governing framework, to:

• Verify all details provided in this application and in any supporting documentation.

• Conduct credit, fraud-prevention, identity, sanctions, adverse media, compliance, and risk checks, including AML/KYC screening and consultation with credit-risk information offices, databases, service providers, and entities affiliated with the Bank, where permitted.

• Request additional information or documentation at any time in connection with onboarding, account opening, risk review, or ongoing due diligence.

• Allocate, charge, and debit any applicable verification, compliance, administrative, legal, investigation, service-provider, and third-party processing costs to the Applicant’s account(s), where contractually permitted and/or required.

G. Account Retention, Record-Keeping, and Banking Relationship (ETMO Framework)

1) Bank-governed closure and retention.

Account status, retention, restriction, suspension, and any closure decision are governed exclusively by the Bank’s internal Administration, Compliance, Legal, Security, and Risk functions and may only be implemented following internal review, including, without limitation, risk analysis, AML/KYC review, sanctions screening, fraud review, cybersecurity controls, legal assessment, operational requirements, and/or record-retention considerations.

2) Account retention, record-keeping, and client-initiated closure restrictions.

The Applicant(s) acknowledge(s) that, due to the Bank’s regulatory obligations, auditability requirements, institutional record-retention duties, and long-term compliance commitments, accounts are not closed solely upon a client’s request. If the Applicant(s) wish(es) to terminate the relationship, the Bank may consider such request in accordance with its internal policies and procedures; however, the Bank retains the sole and absolute discretion to maintain the account in an administrative, dormant, restricted, archived, or other non-operational status where necessary to preserve records, satisfy retention obligations, complete compliance review, address outstanding liabilities, obligations, or disputes, and/or ensure orderly settlement and documentation continuity. Nothing in this clause shall be interpreted as excluding or limiting any non-waivable rights available under applicable law.

3) ETMO diplomatic framework.

Account relationships are administered under the sovereign diplomatic framework of the Ecclesiastical and Temporal Missionary Order (ETMO), with reference to protections under the Vienna Convention on Diplomatic Relations (1961) and relevant bilateral and multilateral treaties, as applicable to the Bank’s institutional framework and operations.

4) Disengagement option (no closure).

If the Applicant(s) no longer wish(es) to use the account, the Applicant(s) may submit an outbound transfer instruction to another bank account of their choice, subject at all times to verification, authentication, applicable fees, and full compliance review, and provided that the account continues to satisfy the Bank’s minimum balance requirements both before and after such transfer. Any transfer instruction shall not constitute account closure and shall not limit the Bank’s right to maintain the account in an administrative, dormant, or restricted status where necessary for record retention, compliance review, legal assessment, or orderly settlement.

5) Bank discretion.

The Bank reserves the exclusive and unconditional right to restrict, suspend, terminate, place an account into administrative or restricted status, decline further activity, and/or close an account based upon internal risk analysis, compliance reviews, legal requirements, security concerns, operational integrity, contractual considerations, or any other factor the Bank deems relevant within its governing framework.

6) Administrative review standard.

Accounts maintaining a zero or negative balance and no activity for ninety (90) consecutive days may be subject to internal review and, where appropriate in the Bank’s discretion, may be administratively restricted, archived, or closed in accordance with applicable compliance, AML, security, operational, and record-management procedures.

7) Binding acceptance.

This clause forms an integral part of the Account Application and shall become fully binding upon the Applicant(s) immediately upon signature and/or submission of this Application.

H. Compliance and Regulatory Framework

The Applicant(s) acknowledge(s), understand(s), and accept(s) that:

• Diplomatic Regulatory Framework and Governance. The Bank operates under a sovereign license within a diplomatic regulatory framework, and all accounts, services, products, operations, and client relationships are subject to the Bank’s internal governance, legal structure, compliance standards, risk-management framework, policies, and procedures. References to diplomatic recognition and the Vienna Convention on Diplomatic Relations are included solely to describe the Bank’s institutional framework and protections applicable to its operations.

• AML/KYC and Ongoing Obligations. The Applicant(s) must comply fully and promptly with all onboarding and ongoing AML/KYC, sanctions, source-of-funds, source-of-wealth, identity verification, and monitoring requirements, including the obligation to provide accurate information and supporting documentation whenever requested by the Bank.

• Internationally Aligned Standards. The Bank applies internationally aligned compliance and risk standards, including FATF-based AML controls and generally recognized banking risk frameworks, and may apply monitoring, restrictions, enhanced due diligence, manual review, account limitations, and other control measures whenever required for compliance, security, fraud prevention, legal protection, operational integrity, or institutional risk management.

• Account Retention / Non-Closure Policy. The Bank’s non-closure and retention policy is maintained to support continuity, traceability, auditability, record preservation, and regulatory oversight in accordance with the Bank’s governing framework and internal policies. Any requests, challenges, objections, disputes, or claims relating to this policy shall be addressed exclusively through the procedures applicable under the Bank’s institutional framework, sovereign diplomatic jurisdiction, and internal governance and dispute-resolution processes.

Nothing in this section shall be construed to limit or exclude the Bank’s obligations to conduct AML/KYC reviews, sanctions screening, fraud prevention monitoring, record-keeping, internal investigations, or to respond to lawful requests where applicable under the Bank’s governing framework.

I. Data Processing and Privacy

The Applicant(s) acknowledge(s), understand(s), and accept(s) that:

• Personal data and related information provided by the Applicant(s) are required for the purposes of evaluating, processing, administering, verifying, and managing this application and any requested or existing banking services.

• The Bank is authorized to collect, process, record, verify, analyze, transfer, retain, and store such data in order to facilitate present and future transactions and to satisfy legal, compliance, operational, audit, fraud-prevention, cybersecurity, and security obligations.

• Such data may be stored, controlled, overseen, and processed by the Bank as data controller and/or by authorized service providers, processors, affiliates, contractors, or agents acting on the Bank’s behalf and under its instructions, subject to applicable law and internal governance procedures.

Rights of the Applicant(s):

Subject to applicable law and the Bank’s governing framework, the Applicant(s) may request access to, rectification of, objection to certain processing of, restriction of processing of, or deletion of personal data, where such rights are available and enforceable.

Any such request must be made in writing to the Bank in accordance with the Bank’s applicable data protection procedures, verification standards, and governing legal framework.

J. Additional Standard Banking Provisions (General)

The Applicant(s) further acknowledge(s), accept(s), and irrevocably agree(s) to the following provisions, each of which forms part of the binding service agreement with the Bank:

1. Bank discretion and service availability

The Bank may, at its sole and absolute discretion, decline, delay, restrict, suspend, refuse, reverse, or not process any application, account service, instruction, transaction, transfer, payment, or product feature where required for compliance, security, risk management, operational integrity, legal protection, incomplete information, unsatisfactory due diligence, or any other reason permitted under the Bank’s governing framework.

2. Transaction controls, holds, and third parties

The Bank may apply manual review, verification holds, enhanced due diligence, temporary restrictions, reserve requirements, and other internal controls whenever deemed necessary for AML/KYC, sanctions compliance, fraud prevention, cybersecurity, legal review, operational risk, or institutional protection. The Applicant(s) further acknowledge(s) that payment routing may involve intermediaries, correspondents, custodians, networks, exchanges, settlement institutions, and other third parties, and that the Bank shall not be liable for acts, omissions, delays, failures, or charges attributable to such third parties.

3. Fees, charges, and third-party costs

The Applicant(s) agree(s) that all Bank fees, service charges, intermediary or correspondent charges, network fees, blockchain fees, custody fees, FX conversion costs or spreads, investigation costs, legal costs, compliance costs, and third-party charges may be debited, deducted, offset, withheld, or otherwise collected in accordance with the Bank’s fee schedule, pricing policies, or applicable procedures, and such amounts may reduce the net funds credited to or received by the Applicant or beneficiary.

4. Foreign exchange

Where currency conversion is required, authorized, or incidental to processing, the Applicant(s) authorize(s) the Bank to apply the Bank’s prevailing exchange rate, pricing methodology, or conversion spread in effect at the time of execution, including any applicable margin, fee, spread, or operational cost.

5. Statements, records, and reporting deadlines

The Bank’s books, records, systems, logs, data extracts, electronic records, transaction histories, and operational records shall constitute prima facie evidence of account activity and instructions unless proven otherwise by compelling evidence acceptable under the Bank’s applicable framework. The Applicant(s) agree(s) to review all statements, notifications, and account activity promptly and to report any alleged unauthorized transaction, discrepancy, omission, or error within the time periods required by the Bank’s policies and procedures. Failure to do so may result in the relevant records being treated as accurate, correct, approved, and final.

6. Instructions and authentication

The Applicant(s) authorize(s) the Bank to act upon instructions received through approved channels, subject to authentication, verification, and internal review requirements. The Bank may refuse, hold, reverse, or decline any instruction that fails verification, appears inconsistent, incomplete, fraudulent, unusual, high-risk, non-compliant, or otherwise unacceptable in the Bank’s sole judgment.

7. Online banking and security responsibility

The Applicant(s) are solely responsible for safeguarding usernames, passwords, PINs, devices, tokens, wallets, email accounts, mobile numbers, authentication credentials, and all other access methods or security elements associated with the account. The Applicant(s) must notify the Bank immediately of any suspected compromise, phishing incident, unauthorized use, attempted intrusion, or other security concern.

8. Electronic communications and notices

The Applicant(s) consent(s) to receive notices, disclosures, statements, security alerts, operational notices, contractual communications, and all other communications electronically using the contact details provided to the Bank. Notices shall be deemed delivered when sent to the last email address, telephone number, mailing address, portal, or other contact information on file. The Applicant(s) are solely responsible for ensuring that their contact details remain current, complete, and accurate at all times.

9. Ongoing disclosure duty

The Applicant(s) must promptly notify the Bank of any material change in information or circumstances, including, without limitation, changes to name, address, residence, nationality, tax status, employment, beneficial ownership, source of funds, source of wealth, expected account activity, risk profile, contact information, or legal status. Failure to do so may result in account restriction, service interruption, enhanced due diligence, or such other measures as the Bank may determine.

10. Prohibited use

The account and any related services must not be used, directly or indirectly, for any unlawful, fraudulent, deceptive, abusive, sanctionable, evasive, or prohibited purpose, including, without limitation, money laundering, terrorist financing, sanctions evasion, fraud, cybercrime, unlawful gambling, unauthorized securities activity, or any activity that may expose the Bank to legal, regulatory, reputational, financial, operational, or security risk.

11. Set-off and recovery

To the maximum extent permitted under the Bank’s governing framework, the Applicant(s) authorize(s) the Bank to debit, withhold, reserve, freeze, set off, net, or otherwise recover from any balance, account, proceeds, or funds held with the Bank any amount owed to the Bank, including fees, charges, costs, negative balances, reversals, liabilities, indemnities, expenses, investigations, losses, and obligations of any kind, whether actual or contingent, matured or unmatured, and the Bank may restrict services until the same have been fully settled.

12. Indemnity

The Applicant(s) agree(s) to indemnify, defend, and hold harmless the Bank, its officers, directors, employees, agents, affiliates, delegates, correspondents, service providers, and contractors from and against any and all losses, damages, liabilities, penalties, costs, claims, demands, actions, proceedings, expenses, and disbursements, including reasonable legal, compliance, audit, and investigation costs, arising out of or relating to: (i) breach of these terms or of the Bank’s policies; (ii) inaccurate, false, incomplete, or misleading information provided by the Applicant(s); (iii) prohibited, unlawful, or high-risk use of the account; or (iv) third-party claims arising from the Applicant’s instructions, conduct, or transactions, except to the extent directly caused by the Bank’s proven gross negligence or willful misconduct under the Bank’s applicable framework.

13. Limitation of liability

To the maximum extent permitted under the Bank’s governing framework, the Bank shall not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, or for any loss of profit, loss of opportunity, loss of use, reputational harm, market loss, third-party loss, or any other indirect loss, whether arising in contract, tort, equity, statute, or otherwise. The Bank shall further not be liable for losses arising from third parties, market conditions, cyber incidents, power failures, telecommunications interruptions, system outages, network failures, correspondent disruptions, sanctions changes, legal or regulatory actions, or events beyond the Bank’s reasonable control. Where liability cannot lawfully be excluded, it shall be limited strictly to direct damages only and subject always to the Bank’s applicable framework.

14. Force majeure

The Bank shall not be responsible or liable for any delay, interruption, suspension, or failure in performance caused directly or indirectly by events beyond its reasonable control, including, without limitation, war, civil unrest, riots, labor disputes, strikes, natural disasters, pandemics, cyberattacks, hacking, telecommunications failures, software or infrastructure failure, correspondent banking interruptions, sanctions changes, legal mandates, regulatory intervention, market disruption, or network failures.

15. Severability; no waiver; entire agreement; updates

If any provision of this Application or related terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall remain in full force and effect. The Bank’s failure or delay in enforcing any right, remedy, term, or provision shall not constitute a waiver thereof. This Application, together with the Bank’s Terms and Conditions, fee schedules, disclosures, policies, procedures, and onboarding documents accepted by the Applicant(s), constitutes the entire agreement between the parties with respect to the subject matter hereof. The Bank may update, revise, supplement, or amend its policies, procedures, operational requirements, or service conditions from time to time, and continued use of the account or services shall constitute acceptance of such changes, subject to the Bank’s notice procedures and applicable law.

16. Waiver of claims based on misunderstanding; dispute handling; reservation of non-waivable rights

The Applicant(s) confirm(s) that they have carefully read and understood this Application, have had the opportunity to ask questions, obtain clarification, and seek independent professional advice prior to signing or submitting it, and are not relying upon any representation other than those expressly set forth by the Bank in writing. To the fullest extent permitted by law, the Applicant(s) expressly waive(s) any right to assert, pursue, or initiate claims or civil/commercial proceedings against the Bank on the basis of alleged misunderstanding, inadequate explanation, misinterpretation, oversight, or failure to read or review the terms of this Application. Any complaint, dispute, controversy, or claim arising out of or in connection with this Application and/or the banking relationship shall be addressed exclusively under the Bank’s institutional framework, sovereign diplomatic jurisdiction, and internal governance and dispute-resolution processes. Nothing in this Application shall exclude or limit any right or remedy that may not lawfully be waived or limited under applicable law. If any part of this clause is held invalid or unenforceable, it shall be enforced to the maximum extent permissible and the remainder shall remain fully effective.

17. No-reliance; opportunity to seek advice

The Applicant(s) confirm(s) that they have read this Application in full, have had adequate opportunity to ask questions and seek independent legal, tax, financial, and other professional advice, and understand(s) that account approval is entirely discretionary and subject to the Bank’s internal onboarding, compliance, and risk criteria. Nothing in this Application shall be interpreted as excluding, restricting, or limiting any mandatory rights available under applicable law.

I confirm that I have read and agree to the "AGREED AND ATTESTED" section, including the payment/refund terms and the Bank's account retention and record-keeping provisions. *

⚠ IMPORTANT NOTICE – INCOMPLETE OR NON-COMPLIANT APPLICATIONS WILL BE REJECTED⚠

Why Choose Prominence Bank?
Prominence Bank provides secure, private, and globally accessible banking, including:

Confidential international transactions

Multilingual customer support

Tailored financial services aligned with your personal or business objectives

For questions limited to application submission and required documents, please contact our team via the official channels listed on the website.`,
    fields: [
      { id: "f48", label: "I Agree", name: "agree", type: "radio", options: ["I Agree"], width: "full", required: true },
      { id: "f49", label: "Full name *", name: "fullName", type: "text", width: "half", required: true },
      { id: "f50", label: "Date *", name: "date", type: "date", width: "half", required: true },
      { id: "f51", label: "Signature *", name: "signature", type: "text", width: "full", required: true },
    ]
  }
];

export const BUSINESS_STEPS: FormStep[] = [
  {
    id: "b2",
    order: 2,
    title: "Company Details",
    description: "Official registration details of the legal entity.",
    fields: [
      { id: "bf1", label: "Company Name", name: "entityName", type: "text", width: "full", required: true },
      { id: "bf2", label: "Registered Address", name: "address", type: "text", width: "full", required: true },
      { id: "bf3", label: "Registered Address Line 2", name: "address2", type: "text", width: "full" },
      { id: "bf4", label: "City", name: "city", type: "text", width: "half" },
      { id: "bf5", label: "State", name: "state", type: "text", width: "half" },
      { id: "bf6", label: "Zip Code", name: "zip", type: "text", width: "half" },
      { id: "bf7", label: "Country", name: "country", type: "text", width: "half", required: true },
      { id: "bf8", label: "Telephone No.", name: "phone", type: "text", width: "half", required: true },
      { id: "bf9", label: "Company Registration No.", name: "regNumber", type: "text", width: "half" },
      { id: "bf10", label: "Date of Incorporation", name: "incorporationDate", type: "date", width: "half", required: true },
      { id: "bf11", label: "Tax ID / VAT Number", name: "taxId", type: "text", width: "half" },
      { id: "bf12", label: "Company Website", name: "website", type: "text", width: "half" },
      { id: "bf13", label: "Company Email", name: "email", type: "email", width: "half", required: true },
      { id: "bf14", label: "Brief Description of Primary Activity", name: "activityDescription", type: "textarea", width: "full", required: true },
    ]
  },
  {
    id: "b3",
    order: 3,
    title: "Activity Profile",
    description: "Define the entity's expected transaction profile.",
    fields: [
      { id: "bf15", label: "Main countries (To)", name: "countriesTo", type: "text", width: "half", required: true },
      { id: "bf16", label: "Main countries (From)", name: "countriesFrom", type: "text", width: "half", required: true },
      { id: "bf17", label: "Estimated Outgoing Transfers / Month", name: "outgoingCount", type: "number", width: "half" },
      { id: "bf18", label: "Estimated Incoming Transfers / Month", name: "incomingCount", type: "number", width: "half" },
      { id: "bf19", label: "Average Value for each Transfer", name: "avgValue", type: "text", width: "half" },
      { id: "bf20", label: "Maximum Value for each Transfer", name: "maxValue", type: "text", width: "half" },
    ]
  },
  {
    id: "b4",
    order: 4,
    title: "Authorized Signatory",
    description: "Details of the individual authorized to operate the account.",
    fields: [
      { id: "bf21", label: "First Name", name: "signatoryFirstName", type: "text", width: "half", required: true },
      { id: "bf22", label: "Middle Name", name: "signatoryMiddleName", type: "text", width: "half" },
      { id: "bf23", label: "Last Name", name: "signatoryLastName", type: "text", width: "half", required: true },
      { id: "bf24", label: "Address", name: "signatoryAddress", type: "text", width: "full", required: true },
      { id: "bf24_2", label: "Address Line 2", name: "signatoryAddress2", type: "text", width: "full" },
      { id: "bf24_c", label: "City", name: "signatoryCity", type: "text", width: "half" },
      { id: "bf24_s", label: "State", name: "signatoryState", type: "text", width: "half" },
      { id: "bf24_z", label: "Zip Code", name: "signatoryZip", type: "text", width: "half" },
      { id: "bf24_cty", label: "Country", name: "signatoryCountry", type: "text", width: "half", required: true },
      { id: "bf25", label: "Nationality", name: "signatoryNationality", type: "text", width: "half", required: true },
      { id: "bf26", label: "Passport/ID No.", name: "signatoryPassport", type: "text", width: "half", required: true },
      { id: "bf27", label: "Passport Issue Date", name: "signatoryPassportIssue", type: "date", width: "half", required: true },
      { id: "bf28", label: "Passport Expiration Date", name: "signatoryPassportExpiry", type: "date", width: "half", required: true },
      { id: "bf29", label: "Signatory Email", name: "signatoryEmail", type: "email", width: "half", required: true },
      { id: "bf29_c", label: "Confirm Signatory Email", name: "signatoryEmailConfirm", type: "email", width: "half", required: true },
      { id: "bf30", label: "Mobile No.", name: "signatoryPhone", type: "text", width: "half", required: true },
      { id: "bf30_f", label: "Fax No.", name: "signatoryFax", type: "text", width: "half" },
    ]
  },
  {
    id: "b5",
    order: 5,
    title: "Directors",
    description: "Identification of company directors.",
    fields: [
      { id: "bf31", label: "Director First Name", name: "directorFirstName", type: "text", width: "half", required: true },
      { id: "bf31_m", label: "Director Middle Name", name: "directorMiddleName", type: "text", width: "half" },
      { id: "bf32", label: "Director Last Name", name: "directorLastName", type: "text", width: "half", required: true },
      { id: "bf33", label: "Director Nationality", name: "directorNationality", type: "text", width: "half", required: true },
      { id: "bf34", label: "Passport/ID No.", name: "directorPassport", type: "text", width: "half", required: true },
      { id: "bf34_i", label: "Passport Issue Date", name: "directorPassportIssue", type: "date", width: "half", required: true },
      { id: "bf34_e", label: "Passport Expiration Date", name: "directorPassportExpiry", type: "date", width: "half", required: true },
      { id: "bf35", label: "Director Address", name: "directorAddress", type: "text", width: "full" },
      { id: "bf36", label: "Director Email", name: "directorEmail", type: "email", width: "half", required: true },
      { id: "bf37", label: "Director Phone", name: "directorPhone", type: "text", width: "half", required: true },
    ]
  },
  {
    id: "b6",
    order: 6,
    title: "Beneficiaries",
    description: "Identification of ultimate corporate beneficiaries.",
    fields: [
      { id: "bf40", label: "UBO Share (%)", name: "beneficiaryShare", type: "number", width: "half", required: true },
      { id: "bf38", label: "UBO First Name", name: "beneficiaryFirstName", type: "text", width: "half", required: true },
      { id: "bf38_m", label: "UBO Middle Name", name: "beneficiaryMiddleName", type: "text", width: "half" },
      { id: "bf39", label: "UBO Last Name", name: "beneficiaryLastName", type: "text", width: "half", required: true },
      { id: "bf41", label: "UBO Nationality", name: "beneficiaryNationality", type: "text", width: "half", required: true },
      { id: "bf42", label: "UBO Passport No.", name: "beneficiaryPassport", type: "text", width: "half", required: true },
      { id: "bf42_i", label: "Passport Issue Date", name: "beneficiaryPassportIssue", type: "date", width: "half", required: true },
      { id: "bf42_e", label: "Passport Expiration Date", name: "beneficiaryPassportExpiry", type: "date", width: "half", required: true },
      { id: "bf43", label: "UBO Address", name: "beneficiaryAddress", type: "text", width: "full" },
      { id: "bf43_p", label: "Phone No.", name: "beneficiaryPhone", type: "text", width: "half", required: true },
      { id: "bf43_e", label: "Email Address", name: "beneficiaryEmail", type: "email", width: "half", required: true },
    ]
  },
  {
    id: "b7",
    order: 7,
    title: "Funding & Account Details",
    description: "Initial corporate funding origin and primary account preferences.",
    fields: [
      { id: "bf46_a", label: "Originating Bank Address", name: "fundingBankAddr", type: "text", width: "full" },
      { id: "bf44", label: "Value of Initial Funding", name: "fundingValue", type: "text", width: "half" },
      { id: "bf45", label: "Funding Currency", name: "fundingCurrency", type: "text", width: "half" },
      { id: "bf46", label: "Originating Bank Name", name: "fundingBank", type: "text", width: "half" },
      { id: "bf46_n", label: "Account Name (at originating bank)", name: "fundingAccName", type: "text", width: "half" },
      { id: "bf46_no", label: "Account Number", name: "fundingAccNo", type: "text", width: "half" },
      { id: "bf46_s", label: "Signatory", name: "fundingSignatory", type: "text", width: "half" },
      { id: "bf50", label: "How were funds generated?", name: "wealthSource", type: "textarea", width: "full", required: true },
      { id: "bf47", label: "Account Currency (Primary Account)", name: "accCurrency", type: "text", width: "half", required: true },
      { id: "bf48", label: "Account Name Reference (Optional)", name: "accRef", type: "text", width: "half" },
      { id: "bf49", label: "Recommended By (Referral)", name: "referral", type: "text", width: "half" },
    ]
  }
];
