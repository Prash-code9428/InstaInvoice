// src/constants/legalContent.js

export const TERMS_AND_CONDITIONS = `
InstaInvoice – Terms of Service & End-User License Agreement
Last Updated: June 2026

1. ACCEPTANCE OF TERMS
By creating an account, logging in, or utilizing any services provided by InstaInvoice ("the Platform"), you ("the User" or "Enterprise") agree to be legally bound by these Terms & Conditions. If you do not agree to these terms, you must immediately cease all utilization of the platform.

2. USER ELIGIBILITY AND ACCOUNT SECURITY
- To access the invoicing and dashboard tools, users must authenticate via our secure JSON Web Token (JWT) workflow. 
- You are solely responsible for maintaining the confidentiality of your account credentials, hashed passwords, and local storage tokens.
- Any unauthorized activity occurring under your account must be reported immediately to dev.prashisalive@gmail.com.

3. ACCURACY OF ENTERPRISE DATA & TAX REPRESENTATIONS
InstaInvoice offers specialized billing streams matching Indian tax frameworks:
- Regular Taxpayers are strictly required to input a valid, legally verified 15-digit Goods and Services Tax Identification Number (GSTIN).
- Composition Scheme users must accurately self-declare their status. The platform will automatically enforce statutory rules by stripping tax collections, retitling sheets to "Bill of Supply", and appending mandatory legal footnotes.
- Unregistered/Micro-businesses represent that they fall beneath the government-mandated threshold for registration.
- The User retains absolute liability for the accuracy, legality, and validity of all corporate profiles, customer addresses, HSN/SAC codes, inventory pricing, and discounts input into the system.

4. TAX COMPUTATION DISCLAIMER & LIMITATION OF LIABILITY
- InstaInvoice is a structural document generation utility, not a certified accounting, auditing, or tax consulting firm.
- While the platform runs automated logical mathematics to break down CGST, SGST, and cross-border aggregates, these calculations are based entirely on user configurations.
- InstaInvoice, its infrastructure, and its developer (Prashant) offer absolutely no warranty—express or implied—regarding the absolute compliance of generated documents with real-time changing fiscal amendments. 
- The ultimate responsibility for verification, tax filing (GSTR-1, GSTR-3B, GSTR-4, etc.), and reconciliation rests exclusively with the User. We shall not be held liable for any financial penalties, interest charges, legal audits, or revenue losses resulting from mathematical discrepancies, missing profile fields, or platform downtime.

5. INTELLECTUAL PROPERTY & ATTRIBUTION
The design interface, backend routing logic, unique visual themes, and branding assets of InstaInvoice are the exclusive intellectual property of the developer, Prashant. The developer's structural credit attribution in the application footer must remain intact and unaltered.
`;

export const PRIVACY_POLICY = `
InstaInvoice – Privacy & Data Protection Policy
Last Updated: June 2026

1. THE PRIVACY PLEDGE
At InstaInvoice, we believe your business financial data is your own. We operate on a data-minimization framework designed to keep your business records secure, private, and unmonitored.

2. DATA WE COLLECT & STORAGE ARCHITECTURE
To deliver automated, zero-typing invoicing streams, we securely store the following data parameters in our isolated database instances:
- User Authentication Records: Full Name, verified corporate Email address, and cryptographically salted, one-way hashed passwords utilizing the bcryptjs framework. (We can never read your raw password).
- Enterprise Profiles: Legal Business Name, physical Billing/Shipping addresses, telephone contacts, verified GSTIN records, uploaded logos, and signature image data assets.
- Settlement Metadata: Enterprise Bank Account Numbers, Bank Names, IFSC Codes, Branch Names, and UPI IDs designated by you to receive client clearings.
- Transaction Ledgers: Client metadata records, itemized inventory variables (Names, base amounts, batch numbers, HSN/SAC numbers), and historical generated invoice calculations.

3. SECURITY AND SESSION TOKEN MANAGEMENT
- Session Integrity: We do not store persistent cookie tracking arrays. User sessions are verified on every single API handshake using an Authorization header containing an encrypted JSON Web Token (JWT) expiring automatically every 7 days.
- Asset Protection: Uploaded logos and authorized business signatures are stored under strictly mapped local or static server directories, isolated to the authenticated User ID via custom middleware interceptors.

4. ZERO THIRD-PARTY SHARING AND MONETIZATION
- We do not sell, rent, monetize, or lease your invoice histories, client contact books, or volume metrics to any data brokers, analytics corporations, or credit agencies.
- All database content remains protected inside our self-contained clusters, accessible solely by the authorized account owner.

5. ACCESS AND DELETION RIGHTS
Users retain absolute control over their files. At any point, you may access, alter, or permanently purge your corporate profile information, inventory tables, or entire invoice histories through your settings dashboard. For absolute manual account termination, contact dev.prashisalive@gmail.com.
`;

export const GST_GUIDELINES = `
InstaInvoice – Statutory GST Invoicing & Compliance Guidelines
Reference Framework: Central Board of Indirect Taxes and Customs (CBIC), Government of India

To ensure the documents you distribute to your vendors and clients satisfy the operational mandates of the Indian GST framework, please configure your InstaInvoice profile in accordance with the rules outlined below:

1. TAX INVOICE STRUCTURE (REGULAR TAXPAYER TIER)
Pursuant to Section 31 of the CGST Act, 2017, registered businesses supplying taxable items must issue a formal "Tax Invoice".
- Core Mandates: Your layout must display your 15-digit GSTIN, a sequential unique invoice number containing only alphanumeric or special characters, and corresponding HSN (Harmonized System of Nomenclature) codes for goods or SAC codes for services.
- Mathematical Split: 
  * Intra-State Transactions: If your enterprise state matches your customer's billing state, the system splits the default tax rate perfectly into Central GST (CGST) and State GST (SGST).
  * Inter-State Transactions: For cross-border distributions, Integrated GST (IGST) matching the full tax rate tier must be applied.

2. BILL OF SUPPLY MANDATES (COMPOSITION SCHEME TIER)
Taxpayers registered under the Composition Scheme (Section 10 of the CGST Act) do not operate under standard input credit mechanisms and are strictly prohibited from collecting tax from recipients.
- Document Restrictions: Your document cannot display separate tax rows, CGST, or SGST fields. The sheet is legally retitled to "Bill of Supply".
- Compulsory Legal Footnote: Per GST Rules, the base of the sheet must explicitly display the statutory declaration:
  "Composition taxable person, not eligible to collect tax on supplies."

3. UNREGISTERED OPERATION (EXEMPT / MICRO-BUSINESS TIER)
Small scale operations with aggregate turnovers falling below the threshold mandates are exempted from GST registrations.
- Your profiles are permitted to produce clean, commercial bills or cash memos completely devoid of tax fields, registration numbers, or statutory breakdowns.

For real-time legal notifications, absolute rate structures, and official filing adjustments, please cross-reference your records directly with the official Government of India GST Portal at: https://www.gst.gov.in
`;