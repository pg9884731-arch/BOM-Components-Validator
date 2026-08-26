import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import {
  Upload, FileText, FileSpreadsheet, Database, CheckCircle2,
  AlertTriangle, XCircle, Download, Settings, BookOpen, Plus,
  ExternalLink, Check, X, Minus, Shield, ShieldAlert, Package,
  BarChart3, Loader2, Moon, Sun, Search, AlertCircle,
  Activity, Cpu, TrendingDown, Zap, Globe, FileCheck,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Confidence = "High" | "Medium" | "Low";
type LifecycleStatus = "Active" | "NRND" | "Obsolete" | "EOL";
type RoHSStatus = "Compliant" | "Non-Compliant" | "Exempt";
type DiscrepancyType =
  | "Material Conflict"
  | "Quantity Mismatch"
  | "Missing in BOM"
  | "Part Number Error"
  | "Spec Conflict";
type DiscrepancyStatus = "unresolved" | "confirmed" | "dismissed" | "skipped";
type ViewKey = "upload" | "extraction" | "discrepancy" | "obsolescence" | "audit";
type ExtractionTab = "cad" | "excel" | "sap" | "unified";

interface ExtractedPart {
  id: string;
  refNo: string;
  description: string;
  partNumber: string;
  quantity: number;
  materialGrade: string;
  confidence: Confidence;
  source: "cad" | "excel" | "sap";
}

interface Discrepancy {
  id: string;
  partName: string;
  refId: string;
  discrepancyType: DiscrepancyType;
  cad: string;
  excel: string;
  sap: string;
  status: DiscrepancyStatus;
}

interface ComponentHealth {
  id: string;
  mpn: string;
  description: string;
  manufacturer: string;
  country: string;
  lifecycle: LifecycleStatus;
  eolDate: string;
  rohs: RoHSStatus;
  stock: number;
  category: string;
  suggestedReplacement?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const CAD_PARTS: ExtractedPart[] = [
  { id: "c1",  refNo: "1",  description: "Main Housing Body",         partNumber: "HSG-001-A",       quantity: 1,  materialGrade: "FG 280 Cast Iron",             confidence: "High",   source: "cad" },
  { id: "c2",  refNo: "2",  description: "Drive Shaft Assembly",      partNumber: "SHA-204-B",       quantity: 1,  materialGrade: "AISI 4140 Steel (HT)",         confidence: "High",   source: "cad" },
  { id: "c3",  refNo: "3",  description: "Angular Contact Bearing",   partNumber: "6205-2RS-SKF",    quantity: 2,  materialGrade: "52100 Bearing Steel",          confidence: "High",   source: "cad" },
  { id: "c4",  refNo: "4",  description: "Mechanical Seal Assembly",  partNumber: "MSL-AG-30-NBR",   quantity: 1,  materialGrade: "NBR / Carbon / Ceramic",       confidence: "Medium", source: "cad" },
  { id: "c5",  refNo: "5",  description: "Centrifugal Impeller",      partNumber: "IMP-CF8M-125",    quantity: 1,  materialGrade: "CF8M Stainless Steel",         confidence: "High",   source: "cad" },
  { id: "c6",  refNo: "6",  description: "Bearing Retainer Ring",     partNumber: "RET-1045-32",     quantity: 1,  materialGrade: "AISI 1045 Carbon Steel",       confidence: "High",   source: "cad" },
  { id: "c7",  refNo: "7",  description: "Coupling Half (Drive)",     partNumber: "CPL-GGG40-50",    quantity: 1,  materialGrade: "SG Iron GGG-40",               confidence: "Medium", source: "cad" },
  { id: "c8",  refNo: "8",  description: "Gland Packing",             partNumber: "PKG-PTFE-12SQ",   quantity: 4,  materialGrade: "Expanded PTFE 12×12 mm",       confidence: "High",   source: "cad" },
  { id: "c9",  refNo: "9",  description: "O-Ring Seal P30",           partNumber: "ORS-FKM-75A-P30", quantity: 3,  materialGrade: "FKM 75 Shore A",               confidence: "High",   source: "cad" },
  { id: "c10", refNo: "10", description: "Hex Head Bolt M16×60",      partNumber: "HB-M16-60-A270",  quantity: 12, materialGrade: "A2-70 Stainless Steel",        confidence: "High",   source: "cad" },
  { id: "c11", refNo: "11", description: "Flat Washer M16 DIN 125",   partNumber: "FW-M16-DIN125-SS",quantity: 12, materialGrade: "A2 Stainless Steel",           confidence: "High",   source: "cad" },
  { id: "c12", refNo: "12", description: "Drain Plug NPT 1/2\"",      partNumber: "DPG-NPT12-CS",    quantity: 1,  materialGrade: "Carbon Steel ASTM A105",       confidence: "Low",    source: "cad" },
];

const EXCEL_PARTS: ExtractedPart[] = [
  { id: "e1",  refNo: "100", description: "Housing Body",              partNumber: "HSG-001-A",        quantity: 1,  materialGrade: "FG 280 Cast Iron",         confidence: "High",   source: "excel" },
  { id: "e2",  refNo: "101", description: "Drive Shaft Assy",          partNumber: "SHA-204-B",        quantity: 1,  materialGrade: "AISI 4140 Steel",          confidence: "High",   source: "excel" },
  { id: "e3",  refNo: "102", description: "Angular Contact Bearing",   partNumber: "6205-2RS-SKF",     quantity: 4,  materialGrade: "Bearing Steel",            confidence: "High",   source: "excel" },
  { id: "e4",  refNo: "103", description: "Mechanical Seal",           partNumber: "MSL-AG-30-NBR",    quantity: 1,  materialGrade: "NBR / Carbon / Ceramic",   confidence: "High",   source: "excel" },
  { id: "e5",  refNo: "104", description: "Impeller CF8M",             partNumber: "IMP-CF8M-125",     quantity: 1,  materialGrade: "CF8M SS",                  confidence: "High",   source: "excel" },
  { id: "e6",  refNo: "105", description: "Retainer Ring",             partNumber: "RET-1045-32",      quantity: 1,  materialGrade: "AISI 1045",                confidence: "High",   source: "excel" },
  { id: "e7",  refNo: "106", description: "Coupling Half",             partNumber: "CPL-EN-GJS400-50", quantity: 1,  materialGrade: "EN-GJS-400-18",            confidence: "Medium", source: "excel" },
  { id: "e8",  refNo: "107", description: "Gland Packing",             partNumber: "PKG-PTFE-12SQ",    quantity: 4,  materialGrade: "PTFE",                     confidence: "High",   source: "excel" },
  { id: "e9",  refNo: "108", description: "O-Ring FKM",                partNumber: "ORS-FKM-75A-P30",  quantity: 3,  materialGrade: "FKM 75A",                  confidence: "High",   source: "excel" },
  { id: "e10", refNo: "109", description: "Hex Bolt M16×60",           partNumber: "HB-M16-60-A270",   quantity: 12, materialGrade: "A2-70 SS",                 confidence: "High",   source: "excel" },
  { id: "e11", refNo: "110", description: "Washer M16 DIN 125",        partNumber: "FW-M16-DIN125-SS", quantity: 12, materialGrade: "A2 SS",                    confidence: "High",   source: "excel" },
  { id: "e12", refNo: "111", description: "Level Sensor",              partNumber: "LS-4-20MA-FS",     quantity: 1,  materialGrade: "316L SS Housing",          confidence: "Medium", source: "excel" },
];

const SAP_PARTS: ExtractedPart[] = [
  { id: "s1",  refNo: "SAP-0001", description: "Main Pump Housing",     partNumber: "HSG-001-A",       quantity: 1,  materialGrade: "ASTM A276 GR S5410",       confidence: "High",   source: "sap" },
  { id: "s2",  refNo: "SAP-0002", description: "Shaft Assembly",        partNumber: "SHA-204-B",       quantity: 1,  materialGrade: "AISI 4140 Steel (HT)",     confidence: "High",   source: "sap" },
  { id: "s3",  refNo: "SAP-0003", description: "Bearing 6205-2RS",      partNumber: "6205-2RS-SKF",    quantity: 2,  materialGrade: "52100 Chrome Steel",       confidence: "High",   source: "sap" },
  { id: "s4",  refNo: "SAP-0004", description: "Mech. Seal Assembly",   partNumber: "MSL-AG-30-NBR",   quantity: 1,  materialGrade: "NBR Elastomer",            confidence: "High",   source: "sap" },
  { id: "s5",  refNo: "SAP-0005", description: "Pump Impeller CF8M",    partNumber: "IMP-CF8M-125",    quantity: 1,  materialGrade: "CF8M",                     confidence: "High",   source: "sap" },
  { id: "s6",  refNo: "SAP-0006", description: "Retaining Ring",        partNumber: "RET-1045-32",     quantity: 1,  materialGrade: "AISI 1045",                confidence: "High",   source: "sap" },
  { id: "s7",  refNo: "SAP-0007", description: "Coupling Half",         partNumber: "CPL-GGG40-50",    quantity: 1,  materialGrade: "SG Iron GGG-40",           confidence: "High",   source: "sap" },
  { id: "s8",  refNo: "SAP-0008", description: "Gland Packing PTFE",    partNumber: "PKG-PTFE-12SQ",   quantity: 4,  materialGrade: "Expanded PTFE",            confidence: "High",   source: "sap" },
  { id: "s9",  refNo: "SAP-0009", description: "Seal Ring FKM",         partNumber: "ORS-FKM-75A-P30", quantity: 3,  materialGrade: "FKM 75A",                  confidence: "High",   source: "sap" },
  { id: "s10", refNo: "SAP-0010", description: "Bolt Assembly M16",     partNumber: "HB-M16-60-A270",  quantity: 12, materialGrade: "A2-70 SS",                 confidence: "High",   source: "sap" },
  { id: "s11", refNo: "SAP-0011", description: "Washer M16 DIN 125",    partNumber: "FW-M16-DIN125-SS",quantity: 12, materialGrade: "A2 SS DIN 125",            confidence: "High",   source: "sap" },
  { id: "s12", refNo: "SAP-0012", description: "Drain Plug 1/2 NPT",    partNumber: "DPG-NPT12-CS",    quantity: 1,  materialGrade: "ASTM A105 CS",             confidence: "Medium", source: "sap" },
  { id: "s13", refNo: "SAP-0013", description: "Mech. Seal (Backup)",   partNumber: "MSL-AG-30-VITON", quantity: 1,  materialGrade: "FKM / Carbon / SiC",       confidence: "Medium", source: "sap" },
];

const INITIAL_DISCREPANCIES: Discrepancy[] = [
  {
    id: "d1", partName: "Main Housing Body", refId: "REF-001 / SAP-0001",
    discrepancyType: "Material Conflict",
    cad: "FG 280 Cast Iron", excel: "FG 280 Cast Iron",
    sap: "ASTM A276 GR S5410 (Stainless Steel)",
    status: "unresolved",
  },
  {
    id: "d2", partName: "Angular Contact Bearing", refId: "REF-003 / SAP-0003",
    discrepancyType: "Quantity Mismatch",
    cad: "Qty: 2", excel: "Qty: 4", sap: "Qty: 2",
    status: "unresolved",
  },
  {
    id: "d3", partName: "Mech. Seal (Backup) — VITON", refId: "SAP-0013 [No CAD / BOM Match]",
    discrepancyType: "Missing in BOM",
    cad: "— Not Found —", excel: "— Not Found —",
    sap: "MSL-AG-30-VITON  ·  FKM / Carbon / SiC",
    status: "unresolved",
  },
  {
    id: "d4", partName: "Coupling Half (Drive)", refId: "REF-007 / SAP-0007",
    discrepancyType: "Part Number Error",
    cad: "CPL-GGG40-50  ·  SG Iron GGG-40",
    excel: "CPL-EN-GJS400-50  ·  EN-GJS-400-18",
    sap: "CPL-GGG40-50  ·  SG Iron GGG-40",
    status: "unresolved",
  },
  {
    id: "d5", partName: "Level Sensor", refId: "EXCEL-111 [No CAD / SAP Match]",
    discrepancyType: "Missing in BOM",
    cad: "— Not Found —",
    excel: "LS-4-20MA-FS  ·  316L SS Housing",
    sap: "— Not Found —",
    status: "unresolved",
  },
  {
    id: "d6", partName: "Drain Plug NPT 1/2\"", refId: "REF-012 / SAP-0012",
    discrepancyType: "Spec Conflict",
    cad: "Carbon Steel ASTM A105  [Low Confidence]",
    excel: "— Not Listed in BOM —",
    sap: "ASTM A105 CS",
    status: "unresolved",
  },
];

const COMPONENT_HEALTH: ComponentHealth[] = [
  { id: "ch1",  mpn: "6205-2RS-SKF",       description: "Deep Groove Ball Bearing, 25 mm Bore",         manufacturer: "SKF Group",              country: "Sweden",      lifecycle: "Active",   eolDate: "2032+",     rohs: "Compliant",     stock: 14200, category: "Bearings" },
  { id: "ch2",  mpn: "LS-4-20MA-FS",       description: "4-20 mA Level Transmitter, 0–10 m Range",       manufacturer: "Endress+Hauser",         country: "Switzerland", lifecycle: "NRND",     eolDate: "Dec 2025",  rohs: "Compliant",     stock: 342,   category: "Sensors",       suggestedReplacement: "LS-4-20MA-G2 (Gen 2)" },
  { id: "ch3",  mpn: "MSL-AG-30-NBR",      description: "Mechanical Seal 30 mm, NBR/Carbon/Ceramic",     manufacturer: "John Crane",             country: "USA",         lifecycle: "Active",   eolDate: "2030+",     rohs: "Compliant",     stock: 890,   category: "Seals" },
  { id: "ch4",  mpn: "REL-24VDC-SPDT",     description: "Control Relay 24 VDC SPDT 10 A",                manufacturer: "Omron Corporation",      country: "Japan",       lifecycle: "Obsolete", eolDate: "Mar 2023",  rohs: "Non-Compliant", stock: 0,     category: "Relays",        suggestedReplacement: "G2RL-1-E-CF DC24 (RoHS)" },
  { id: "ch5",  mpn: "CAP-470UF-63V-EL",   description: "Electrolytic Capacitor 470 µF 63 V Radial",     manufacturer: "Nichicon Corp.",         country: "Japan",       lifecycle: "Active",   eolDate: "2035+",     rohs: "Compliant",     stock: 28400, category: "Capacitors" },
  { id: "ch6",  mpn: "TRM-DIN-3P-10A",     description: "DIN Rail Terminal Block 3-Pole 10 A 600 V",     manufacturer: "Phoenix Contact",        country: "Germany",     lifecycle: "Active",   eolDate: "2033+",     rohs: "Compliant",     stock: 56000, category: "Terminals" },
  { id: "ch7",  mpn: "PS-24VDC-5A-DIN",    description: "DIN Rail PSU 24 VDC 5 A 120 W",                 manufacturer: "Mean Well",              country: "Taiwan",      lifecycle: "NRND",     eolDate: "Jun 2026",  rohs: "Compliant",     stock: 1240,  category: "Power Supply",  suggestedReplacement: "SDR-120D-24 (Drop-in 5 A)" },
  { id: "ch8",  mpn: "PRS-4-20MA-316L",    description: "Pressure Transmitter 0–40 bar, 4-20 mA",        manufacturer: "WIKA Alexander Wiegand", country: "Germany",     lifecycle: "Active",   eolDate: "2031+",     rohs: "Compliant",     stock: 1840,  category: "Sensors" },
  { id: "ch9",  mpn: "FUSE-10A-250V-CER",  description: "Ceramic Fuse 10 A 250 V 5×20 mm",               manufacturer: "Littelfuse Inc.",        country: "USA",         lifecycle: "EOL",      eolDate: "Jan 2024",  rohs: "Non-Compliant", stock: 0,     category: "Protection",   suggestedReplacement: "0215010.MXP (RoHS, 10 A)" },
  { id: "ch10", mpn: "CON-M12-4P-IP67",    description: "M12 Circular Connector 4-Pin Female IP67",      manufacturer: "HARTING Technology",     country: "Germany",     lifecycle: "Active",   eolDate: "2034+",     rohs: "Compliant",     stock: 22100, category: "Connectors" },
];

const LIFECYCLE_COUNTS = {
  Active:   COMPONENT_HEALTH.filter(c => c.lifecycle === "Active").length,
  NRND:     COMPONENT_HEALTH.filter(c => c.lifecycle === "NRND").length,
  Obsolete: COMPONENT_HEALTH.filter(c => c.lifecycle === "Obsolete").length,
  EOL:      COMPONENT_HEALTH.filter(c => c.lifecycle === "EOL").length,
};

// ─── Shared Badge Components ────────────────────────────────────────────────────

function ConfidencePill({ level }: { level: Confidence }) {
  const map = {
    High:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    Low:    "bg-red-500/15 text-red-400 border-red-500/25",
  };
  const dot = {
    High: "bg-emerald-400", Medium: "bg-amber-400", Low: "bg-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${map[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[level]}`} />
      {level}
    </span>
  );
}

function LifecycleBadge({ status }: { status: LifecycleStatus }) {
  const map = {
    Active:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    NRND:     "bg-amber-500/15 text-amber-400 border-amber-500/25",
    Obsolete: "bg-red-500/15 text-red-400 border-red-500/25",
    EOL:      "bg-red-900/30 text-red-300 border-red-500/25",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${map[status]}`}>
      {status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {status}
    </span>
  );
}

function RoHSBadge({ status }: { status: RoHSStatus }) {
  const map = {
    "Compliant":     "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    "Non-Compliant": "bg-red-500/15 text-red-400 border-red-500/25",
    "Exempt":        "bg-slate-500/15 text-slate-400 border-slate-500/25",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${map[status]}`}>
      {status === "Compliant"
        ? <Shield className="w-3 h-3" />
        : <ShieldAlert className="w-3 h-3" />}
      {status}
    </span>
  );
}

function DiscrepancyTypeBadge({ type }: { type: DiscrepancyType }) {
  const map: Record<DiscrepancyType, string> = {
    "Material Conflict": "bg-amber-500/15 text-amber-300 border-amber-500/25",
    "Quantity Mismatch": "bg-sky-500/15 text-sky-300 border-sky-500/25",
    "Missing in BOM":    "bg-red-500/15 text-red-300 border-red-500/25",
    "Part Number Error": "bg-violet-500/15 text-violet-300 border-violet-500/25",
    "Spec Conflict":     "bg-orange-500/15 text-orange-300 border-orange-500/25",
  };
  const icon: Record<DiscrepancyType, React.ReactNode> = {
    "Material Conflict": <AlertTriangle className="w-3 h-3" />,
    "Quantity Mismatch": <AlertCircle className="w-3 h-3" />,
    "Missing in BOM":    <XCircle className="w-3 h-3" />,
    "Part Number Error": <AlertCircle className="w-3 h-3" />,
    "Spec Conflict":     <AlertTriangle className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${map[type]}`}>
      {icon[type]}{type}
    </span>
  );
}

// ─── View 1: Upload Center ──────────────────────────────────────────────────────

interface FileSlotState {
  file: File | null;
  progress: number;
  status: "idle" | "uploading" | "done";
}

function UploadCenter({ onExtract }: { onExtract: () => void }) {
  const [slots, setSlots] = useState<Record<string, FileSlotState>>({
    cad:   { file: null, progress: 0, status: "idle" },
    excel: { file: null, progress: 0, status: "idle" },
    sap:   { file: null, progress: 0, status: "idle" },
  });
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const slotDefs = [
    {
      key: "cad",
      label: "Cross-Section CAD Drawing",
      subtitle: "PDF Engineering Blueprint",
      accept: ".pdf",
      icon: <FileCheck className="w-6 h-6" />,
      accent: { border: "border-cyan-500/40", bg: "bg-cyan-500/5", icon: "text-cyan-400", bar: "bg-cyan-500" },
    },
    {
      key: "excel",
      label: "Master BOM",
      subtitle: "Excel / XLSX Parts List",
      accept: ".xlsx,.xls,.csv",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      accent: { border: "border-emerald-500/40", bg: "bg-emerald-500/5", icon: "text-emerald-400", bar: "bg-emerald-500" },
    },
    {
      key: "sap",
      label: "SAP Requirement Data",
      subtitle: "Customer Specification PDF",
      accept: ".pdf",
      icon: <FileText className="w-6 h-6" />,
      accent: { border: "border-violet-500/40", bg: "bg-violet-500/5", icon: "text-violet-400", bar: "bg-violet-500" },
    },
  ];

  const simulateUpload = (key: string, file: File) => {
    setSlots(prev => ({ ...prev, [key]: { file, progress: 0, status: "uploading" } }));
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 30 + 8;
      if (p >= 100) {
        clearInterval(iv);
        setSlots(prev => ({ ...prev, [key]: { ...prev[key], progress: 100, status: "done" } }));
        toast.success(`${file.name} — uploaded`);
      } else {
        setSlots(prev => ({ ...prev, [key]: { ...prev[key], progress: p } }));
      }
    }, 180);
  };

  const doneCount  = Object.values(slots).filter(s => s.status === "done").length;
  const allReady   = doneCount === 3;

  const handleExtract = () => {
    setExtracting(true);
    toast.loading("Running AI extraction pipeline — analysing 3 documents…", { id: "extract" });
    setTimeout(() => {
      setExtracting(false);
      toast.success("Extraction complete — 37 parts identified across 3 source documents", { id: "extract" });
      onExtract();
    }, 2800);
  };

  return (
    <div className="space-y-7">
      <div>
        <div className="relative overflow-hidden min-h-[410px] flex items-center justify-center text-center">
          <img
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80"
            alt="Engineer reviewing an industrial assembly"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(36,112,82,0.32),transparent_58%),linear-gradient(180deg,rgba(5,11,9,0.35),#050b09_92%)]" />
          <div className="relative max-w-3xl px-5 py-12">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary mb-6">
              AI-powered engineering intelligence
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-5">
              Transform your BOM into <span className="text-primary">decisions.</span>
            </h2>
            <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
              Validate every component across CAD, Excel, and SAP with one clear source of truth for your engineering team.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => document.getElementById("source-documents")?.scrollIntoView({ behavior: "smooth" })} className="rounded-md bg-primary px-5 py-2.5 text-xs font-semibold text-[#06110d] hover:brightness-110 transition-all">Start an extraction</button>
              <button onClick={() => document.getElementById("source-documents")?.scrollIntoView({ behavior: "smooth" })} className="rounded-md border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors">
                View workflow
              </button>
            </div>
            <div className="mt-12 flex justify-center gap-8 sm:gap-14 text-left">
              <div><div className="text-lg font-semibold text-white">37</div><div className="text-[10px] text-muted-foreground">Parts identified</div></div>
              <div><div className="text-lg font-semibold text-white">87.4%</div><div className="text-[10px] text-muted-foreground">Avg. confidence</div></div>
              <div><div className="text-lg font-semibold text-white">3</div><div className="text-[10px] text-muted-foreground">Sources unified</div></div>
            </div>
          </div>
        </div>

        <div id="source-documents" className="pt-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">Source documents</h3>
          <p className="text-sm text-muted-foreground">Upload all three source documents to begin the AI extraction pipeline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {slotDefs.map(def => {
          const s = slots[def.key];
          const isDone      = s.status === "done";
          const isUploading = s.status === "uploading";
          const isHover     = dragOver === def.key;

          return (
            <div
              key={def.key}
              className={`relative rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer ${
                isDone
                  ? `border-solid ${def.accent.border} ${def.accent.bg}`
                  : isHover
                  ? `${def.accent.border} ${def.accent.bg}`
                  : "border-border hover:border-muted-foreground/30"
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(def.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(null);
                const f = e.dataTransfer.files[0];
                if (f) simulateUpload(def.key, f);
              }}
            >
              <input
                type="file"
                accept={def.accept}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) simulateUpload(def.key, f);
                }}
              />
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-lg bg-muted transition-colors ${isDone ? "text-emerald-400" : def.accent.icon}`}>
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : def.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{def.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{def.subtitle}</div>
                </div>

                {s.file ? (
                  <div className="w-full space-y-2">
                    <div className="text-xs text-muted-foreground truncate font-mono">{s.file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(s.file.size / 1024).toFixed(0)} KB
                    </div>
                    {isUploading && (
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-200 ${def.accent.bar}`}
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    )}
                    {isDone && (
                      <span className="text-xs text-emerald-400 font-medium">Ready for extraction</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Drop file here or{" "}
                    <span className="text-primary underline cursor-pointer">browse</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < doneCount ? "bg-emerald-400" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{doneCount} / 3 documents ready</span>
        </div>

        <button
          onClick={handleExtract}
          disabled={!allReady || extracting}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            allReady && !extracting
              ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {extracting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting…</>
            : <><Zap className="w-4 h-4" /> Start AI Extraction</>}
        </button>
      </div>

      {/* Hint section */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-start gap-3">
        <div className="mt-0.5 w-4 h-4 text-primary flex-shrink-0">
          <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="8" opacity=".15"/><path d="M7.25 6.5h1.5v5h-1.5zM7.25 4.5h1.5v1.5h-1.5z"/></svg>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Supported formats: <span className="font-mono text-foreground">PDF</span> for CAD drawings and SAP reports,{" "}
          <span className="font-mono text-foreground">XLSX / XLS / CSV</span> for Master BOM.
          Maximum file size: <span className="font-mono text-foreground">50 MB</span> per document.
          AI extraction uses vision + OCR to parse balloon callouts, tolerance annotations, and tabular BOM data.
        </p>
      </div>
    </div>
  );
}

// ─── View 2: Extraction & Source Comparison ─────────────────────────────────────

function ExtractionView() {
  const [activeTab, setActiveTab] = useState<ExtractionTab>("cad");
  const [search, setSearch] = useState("");

  const tabs: { key: ExtractionTab; label: string; count: number; active: string }[] = [
    { key: "cad",     label: "CS Drawing BOM",  count: CAD_PARTS.length,   active: "text-cyan-300 border-cyan-500/30 bg-cyan-600/10" },
    { key: "excel",   label: "Excel BOM",        count: EXCEL_PARTS.length, active: "text-emerald-300 border-emerald-500/30 bg-emerald-600/10" },
    { key: "sap",     label: "SAP Data",         count: SAP_PARTS.length,   active: "text-violet-300 border-violet-500/30 bg-violet-600/10" },
    { key: "unified", label: "Unified Matrix",   count: 0,                  active: "text-amber-300 border-amber-500/30 bg-amber-600/10" },
  ];

  const base = activeTab === "cad" ? CAD_PARTS
    : activeTab === "excel" ? EXCEL_PARTS
    : activeTab === "sap"   ? SAP_PARTS
    : [...CAD_PARTS, ...EXCEL_PARTS, ...SAP_PARTS];

  const parts = base.filter(p =>
    !search
    || p.description.toLowerCase().includes(search.toLowerCase())
    || p.partNumber.toLowerCase().includes(search.toLowerCase())
  );

  const srcBadge = (source: ExtractedPart["source"]) => {
    const map = {
      cad:   "bg-cyan-500/15 text-cyan-400",
      excel: "bg-emerald-500/15 text-emerald-400",
      sap:   "bg-violet-500/15 text-violet-400",
    };
    return (
      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${map[source]}`}>
        {source === "cad" ? "CAD" : source === "excel" ? "XLS" : "SAP"}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Extraction &amp; Source Comparison
        </h2>
        <p className="text-sm text-muted-foreground">
          Inspect AI-extracted raw data from each source document before discrepancy analysis.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-all ${
              activeTab === t.key
                ? t.active
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-[11px] px-1.5 py-0 rounded font-mono ${
                activeTab === t.key ? "bg-white/10" : "bg-muted"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search parts…"
            className="pl-8 pr-3 py-1.5 rounded-md text-xs text-foreground placeholder-muted-foreground bg-background border border-border focus:outline-none focus:border-primary w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                {activeTab === "unified" && (
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                )}
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Item / Ref #</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Part Number (MPN)</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Material Grade</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}
                >
                  {activeTab === "unified" && (
                    <td className="px-4 py-3">{srcBadge(p.source)}</td>
                  )}
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.refNo}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.description}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{p.partNumber}</td>
                  <td className="px-4 py-3 text-center font-mono text-foreground">{p.quantity}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{p.materialGrade}</td>
                  <td className="px-4 py-3"><ConfidencePill level={p.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">{parts.length} rows</span>
          <span className="text-xs text-muted-foreground">
            Extraction confidence avg: <span className="text-foreground font-mono">87.4 %</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── View 3: Discrepancy Resolver ───────────────────────────────────────────────

interface DiscrepancyViewProps {
  discrepancies: Discrepancy[];
  setDiscrepancies: React.Dispatch<React.SetStateAction<Discrepancy[]>>;
}

function DiscrepancyView({ discrepancies, setDiscrepancies }: DiscrepancyViewProps) {
  const act = (id: string, status: DiscrepancyStatus) => {
    setDiscrepancies(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    const msgs: Record<DiscrepancyStatus, string> = {
      confirmed: "Mismatch confirmed and flagged for engineering review",
      dismissed: "Discrepancy dismissed — marked as valid",
      skipped:   "Item skipped — will appear in unresolved list",
      unresolved: "",
    };
    if (status !== "unresolved") toast.success(msgs[status]);
  };

  const unresolved = discrepancies.filter(d => d.status === "unresolved").length;
  const resolved   = discrepancies.filter(d => d.status !== "unresolved").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Discrepancy &amp; Mismatch Resolver
          </h2>
          <p className="text-sm text-muted-foreground">
            Human-in-the-loop review of AI-flagged cross-document contradictions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">{unresolved} Unresolved</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">{resolved} Resolved</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {discrepancies.map(d => (
          <DiscrepancyCard key={d.id} disc={d} onAct={act} />
        ))}
      </div>
    </div>
  );
}

function DiscrepancyCard({
  disc,
  onAct,
}: {
  disc: Discrepancy;
  onAct: (id: string, s: DiscrepancyStatus) => void;
}) {
  const resolved = disc.status !== "unresolved";

  const srcs = [
    { key: "cad",   label: "CAD Drawing", color: "text-cyan-400",    value: disc.cad },
    { key: "excel", label: "Excel BOM",   color: "text-emerald-400", value: disc.excel },
    { key: "sap",   label: "SAP Report",  color: "text-violet-400",  value: disc.sap },
  ];

  const conflicted = (key: string) => {
    if (disc.discrepancyType === "Material Conflict" && key === "sap") return true;
    if (disc.discrepancyType === "Quantity Mismatch" && key === "excel") return true;
    if (disc.discrepancyType === "Part Number Error" && key === "excel") return true;
    if (disc.discrepancyType === "Missing in BOM" && key === "sap" && disc.sap.includes("— Not")) return false;
    if (disc.discrepancyType === "Missing in BOM" && key === "excel" && disc.excel.includes("— Not")) return false;
    if (disc.discrepancyType === "Spec Conflict" && key === "excel") return true;
    return false;
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        resolved
          ? "border-border/40 bg-card/30 opacity-60"
          : "border-border bg-card hover:border-muted-foreground/30"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{disc.partName}</span>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{disc.refId}</span>
          <DiscrepancyTypeBadge type={disc.discrepancyType} />
        </div>
        {resolved && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            disc.status === "confirmed" ? "text-red-400 bg-red-500/10"
            : disc.status === "dismissed" ? "text-emerald-400 bg-emerald-500/10"
            : "text-muted-foreground bg-muted"
          }`}>
            {disc.status === "confirmed" ? "✓ Mismatch Confirmed"
            : disc.status === "dismissed" ? "✓ Marked Valid"
            : "— Skipped"}
          </span>
        )}
      </div>

      {/* 3-way comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
        {srcs.map(src => {
          const isMissing = src.value.includes("— Not");
          const isConflict = conflicted(src.key);
          return (
            <div key={src.key} className="px-5 py-4">
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${src.color}`}>
                {src.label}
              </div>
              <div className={`text-sm font-mono leading-relaxed break-words ${
                isMissing   ? "text-muted-foreground/40 italic"
                : isConflict ? "text-amber-300"
                : "text-foreground"
              }`}>
                {src.value}
                {isConflict && (
                  <span className="ml-2 text-[10px] text-amber-400 not-italic">⚠ Mismatch</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action toolbar */}
      {!resolved && (
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t border-border/60 bg-muted/20">
          <button
            onClick={() => onAct(disc.id, "confirmed")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
          >
            <Check className="w-3.5 h-3.5" /> Agree — Confirm Mismatch
          </button>
          <button
            onClick={() => onAct(disc.id, "dismissed")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Disagree — Mark Valid
          </button>
          <button
            onClick={() => onAct(disc.id, "skipped")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Minus className="w-3.5 h-3.5" /> Ignore / Skip
          </button>
        </div>
      )}
    </div>
  );
}

// ─── View 4: Obsolescence Dashboard ────────────────────────────────────────────

function ObsolescenceDashboard() {
  const [filter, setFilter] = useState<LifecycleStatus | "All">("All");
  const [search, setSearch] = useState("");

  const data = COMPONENT_HEALTH.filter(c => {
    const fOk = filter === "All" || c.lifecycle === filter;
    const sOk = !search
      || c.mpn.toLowerCase().includes(search.toLowerCase())
      || c.description.toLowerCase().includes(search.toLowerCase())
      || c.manufacturer.toLowerCase().includes(search.toLowerCase());
    return fOk && sOk;
  });

  const statRow = [
    { label: "Active",          value: LIFECYCLE_COUNTS.Active,                                icon: <Activity className="w-4 h-4" />,    color: "text-emerald-400" },
    { label: "NRND (At Risk)",  value: LIFECYCLE_COUNTS.NRND,                                  icon: <AlertTriangle className="w-4 h-4" />,color: "text-amber-400" },
    { label: "Obsolete / EOL",  value: LIFECYCLE_COUNTS.Obsolete + LIFECYCLE_COUNTS.EOL,       icon: <TrendingDown className="w-4 h-4" />, color: "text-red-400" },
    { label: "RoHS Non-Compl.", value: COMPONENT_HEALTH.filter(c => c.rohs === "Non-Compliant").length, icon: <ShieldAlert className="w-4 h-4" />,  color: "text-red-400" },
  ];

  const filters: { key: LifecycleStatus | "All"; label: string }[] = [
    { key: "All",      label: `All (${COMPONENT_HEALTH.length})` },
    { key: "Active",   label: `Active (${LIFECYCLE_COUNTS.Active})` },
    { key: "NRND",     label: `NRND (${LIFECYCLE_COUNTS.NRND})` },
    { key: "Obsolete", label: `Obsolete (${LIFECYCLE_COUNTS.Obsolete})` },
    { key: "EOL",      label: `EOL (${LIFECYCLE_COUNTS.EOL})` },
  ];

  return (
    <div className="space-y-5">
      <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
          DigiKey Obsolescence &amp; Lifecycle Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time component health, lifecycle status, RoHS compliance, and distributor stock levels.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statRow.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl px-4 py-3">
            <div className={`flex items-center gap-2 mb-1.5 ${s.color}`}>
              {s.icon}
              <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filter === f.key
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search MPN or manufacturer…"
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs text-foreground placeholder-muted-foreground bg-background border border-border focus:outline-none focus:border-primary w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Part Number (MPN)</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description / Category</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Manufacturer</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Lifecycle</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Est. EOL</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">RoHS</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Dist. Stock</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Suggested Replacement</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">DS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-border/50 hover:bg-muted/25 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""} ${c.lifecycle === "Obsolete" || c.lifecycle === "EOL" ? "bg-red-900/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-mono text-primary hover:text-primary/80 hover:underline transition-colors"
                      onClick={() => toast.info(`Viewing DigiKey details for ${c.mpn}`)}
                    >
                      {c.mpn}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">{c.description}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{c.category}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">{c.manufacturer}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{c.country}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><LifecycleBadge status={c.lifecycle} /></td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.eolDate}</td>
                  <td className="px-4 py-3"><RoHSBadge status={c.rohs} /></td>
                  <td className="px-4 py-3">
                    <div className={`text-sm font-mono font-semibold ${
                      c.stock === 0 ? "text-red-400"
                      : c.stock < 500 ? "text-amber-400"
                      : "text-emerald-400"
                    }`}>
                      {c.stock === 0 ? "Out of Stock" : c.stock.toLocaleString()}
                    </div>
                    {c.stock > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">units in stock</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.suggestedReplacement ? (
                      <span
                        title={c.suggestedReplacement}
                        className="inline-block text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded max-w-[180px] truncate"
                      >
                        {c.suggestedReplacement}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toast.info(`Opening datasheet for ${c.mpn}`)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground font-mono">{data.length} components shown</span>
        </div>
      </div>
    </div>
  );
}

// ─── View 5: Audit Summary & Report Exporter ────────────────────────────────────

function AuditSummary({ discrepancies }: { discrepancies: Discrepancy[] }) {
  const totalScanned  = CAD_PARTS.length + EXCEL_PARTS.length + SAP_PARTS.length;
  const uniqueParts   = 14;
  const matched       = 9;
  const matchRate     = Math.round((matched / uniqueParts) * 100);
  const totalMisx     = INITIAL_DISCREPANCIES.length;
  const obsolete      = COMPONENT_HEALTH.filter(c => c.lifecycle === "Obsolete" || c.lifecycle === "EOL").length;
  const nonRoHS       = COMPONENT_HEALTH.filter(c => c.rohs === "Non-Compliant").length;
  const confirmed     = discrepancies.filter(d => d.status === "confirmed").length;
  const dismissed     = discrepancies.filter(d => d.status === "dismissed").length;
  const unresolvedCt  = discrepancies.filter(d => d.status === "unresolved").length;

  const metrics = [
    { label: "Total Parts Scanned",  value: totalScanned,  sub: "across 3 source documents",      icon: <Package className="w-5 h-5" />,     color: "text-primary" },
    { label: "Match Rate",           value: `${matchRate}%`, sub: `${matched} / ${uniqueParts} parts`, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-400" },
    { label: "Total Mismatches",     value: totalMisx,     sub: `${confirmed} confirmed · ${dismissed} dismissed`,   icon: <AlertTriangle className="w-5 h-5" />, color: "text-amber-400" },
    { label: "Obsolete Components",  value: obsolete,      sub: "EOL or discontinued",             icon: <TrendingDown className="w-5 h-5" />, color: "text-red-400" },
    { label: "RoHS Non-Compliant",   value: nonRoHS,       sub: "require engineering attention",   icon: <ShieldAlert className="w-5 h-5" />,  color: "text-red-400" },
  ];

  const discBreakdown = [
    { type: "Material Conflict", count: 1, w: 17, color: "bg-amber-500" },
    { type: "Quantity Mismatch", count: 1, w: 17, color: "bg-sky-500" },
    { type: "Missing in BOM",    count: 2, w: 33, color: "bg-red-500" },
    { type: "Part Number Error", count: 1, w: 17, color: "bg-violet-500" },
    { type: "Spec Conflict",     count: 1, w: 17, color: "bg-orange-500" },
  ];

  const lcBreakdown = [
    { label: "Active",                 count: LIFECYCLE_COUNTS.Active,   total: COMPONENT_HEALTH.length, color: "bg-emerald-500" },
    { label: "NRND (Not Recommended)", count: LIFECYCLE_COUNTS.NRND,     total: COMPONENT_HEALTH.length, color: "bg-amber-500" },
    { label: "Obsolete",               count: LIFECYCLE_COUNTS.Obsolete, total: COMPONENT_HEALTH.length, color: "bg-red-500" },
    { label: "End of Life (EOL)",      count: LIFECYCLE_COUNTS.EOL,      total: COMPONENT_HEALTH.length, color: "bg-red-700" },
  ];

  const exports = [
    { label: "Download Full Validation Report (PDF)", icon: <FileText className="w-4 h-4" />,      style: "bg-primary text-primary-foreground hover:opacity-90 shadow-lg" },
    { label: "Export Discrepancy Audit (Excel)",      icon: <FileSpreadsheet className="w-4 h-4" />, style: "border border-border bg-muted/40 text-foreground hover:bg-muted" },
    { label: "Export Sourced BOM with Replacements (CSV)", icon: <Database className="w-4 h-4" />,  style: "border border-border bg-muted/40 text-foreground hover:bg-muted" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Audit Summary &amp; Report Exporter
        </h2>
        <p className="text-sm text-muted-foreground">
          Complete validation pipeline results with export options for downstream workflows.
        </p>
      </div>

      {/* Status ribbon */}
      {unresolvedCt > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            <span className="font-semibold">{unresolvedCt} unresolved discrepancies</span> remain.
            Return to the Discrepancy Resolver to complete review before exporting.
          </p>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={`mb-2 ${m.color}`}>{m.icon}</div>
            <div className={`text-3xl font-bold font-mono mb-1 ${m.color}`}>{m.value}</div>
            <div className="text-xs font-semibold text-foreground">{m.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Breakdown charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Discrepancy Breakdown
          </h3>
          <div className="space-y-3">
            {discBreakdown.map(item => (
              <div key={item.type} className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground w-36 flex-shrink-0">{item.type}</div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full opacity-70 ${item.color}`} style={{ width: `${item.w}%` }} />
                </div>
                <div className="text-xs font-mono text-muted-foreground w-4 text-right">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Component Lifecycle Summary
          </h3>
          <div className="space-y-3">
            {lcBreakdown.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground w-44 flex-shrink-0">{item.label}</div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full opacity-70 ${item.color}`}
                    style={{ width: `${Math.round((item.count / item.total) * 100)}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-muted-foreground w-4 text-right">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Export Reports</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {exports.map((e, i) => (
            <button
              key={i}
              onClick={() => toast.success(`${e.label} — preparing download…`)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${e.style}`}
            >
              {e.icon} {e.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Reports include extraction metadata, AI confidence scores, discrepancy audit trail, and DigiKey lifecycle data as of {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}.
        </p>
      </div>
    </div>
  );
}

// ─── Nomenclature Modal ─────────────────────────────────────────────────────────

function NomenclatureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const terms = [
    { term: "MPN",         def: "Manufacturer Part Number — unique identifier assigned by the component manufacturer." },
    { term: "BOM",         def: "Bill of Materials — structured list of parts, subassemblies, and raw materials required." },
    { term: "NRND",        def: "Not Recommended for New Design — lifecycle stage preceding full product obsolescence." },
    { term: "EOL",         def: "End of Life — manufacturer has ceased production; no new orders are accepted." },
    { term: "RoHS",        def: "Restriction of Hazardous Substances — EU Directive 2011/65/EU limiting harmful materials in electronics." },
    { term: "SAP",         def: "Systems, Applications & Products — enterprise ERP platform for business process management." },
    { term: "CAD",         def: "Computer-Aided Design — engineering drawing produced by design software such as SolidWorks or AutoCAD." },
    { term: "FG 280",      def: "Grey Cast Iron grade per DIN EN 1561 — flake graphite iron with 280 MPa min. tensile strength." },
    { term: "ASTM A276",   def: "ASTM Standard for Stainless Steel Bars and Shapes, covering grades 303, 304, 316, 410, etc." },
    { term: "CF8M",        def: "Cast austenitic stainless steel equivalent to wrought AISI 316/316L (higher carbon, cast form)." },
    { term: "AISI 4140",   def: "Chromium-molybdenum alloy steel — high fatigue strength, commonly heat-treated for shafts." },
    { term: "GGG-40",      def: "Spheroidal (ductile) graphite cast iron, ISO grade EN-GJS-400-18 — higher ductility than grey iron." },
    { term: "A2-70",       def: "Stainless steel fastener property class (ISO 3506) — Grade A2 (304 SS), min 700 MPa tensile strength." },
    { term: "PTFE",        def: "Polytetrafluoroethylene — chemically inert polymer used for gland packing and sealing applications." },
    { term: "FKM / Viton", def: "Fluoroelastomer rubber — excellent chemical and high-temperature resistance for dynamic seals." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              Nomenclature Reference
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-2 space-y-0">
          {terms.map(t => (
            <div key={t.term} className="flex gap-4 py-3 border-b border-border/50 last:border-0">
              <div className="text-sm font-mono font-bold text-primary w-28 flex-shrink-0 pt-0.5">{t.term}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{t.def}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Stepper ───────────────────────────────────────────────────────────

const PIPELINE: { id: number; label: string; view: ViewKey }[] = [
  { id: 1, label: "Document Upload",          view: "upload" },
  { id: 2, label: "AI Extraction",            view: "extraction" },
  { id: 3, label: "Tri-Doc Validation",       view: "discrepancy" },
  { id: 4, label: "Obsolescence & Compliance",view: "obsolescence" },
];

function PipelineStepper({ active }: { active: ViewKey }) {
  const stepIndex = PIPELINE.findIndex(p => p.view === active);
  const currentStep = stepIndex === -1 ? 4 : stepIndex;

  return (
    <div className="hidden md:flex items-center gap-0">
      {PIPELINE.map((step, i) => {
        const done    = i < currentStep;
        const current = i === currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-mono border transition-all ${
                done    ? "bg-primary border-primary text-primary-foreground"
                : current ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground"
              }`}>
                {done ? <Check className="w-3 h-3" /> : step.id}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                current ? "text-foreground" : done ? "text-primary/70" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div className={`h-px w-6 mx-2 ${i < currentStep ? "bg-primary/50" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────────

const VIEWS: { key: ViewKey; label: string; icon: React.ComponentType<{ className?: string }>; step: number }[] = [
  { key: "upload",       label: "Document Upload",           icon: Upload,        step: 1 },
  { key: "extraction",   label: "AI Extraction",             icon: Cpu,           step: 2 },
  { key: "discrepancy",  label: "Discrepancy Resolver",      icon: AlertTriangle, step: 3 },
  { key: "obsolescence", label: "Obsolescence & Compliance", icon: Activity,      step: 4 },
  { key: "audit",        label: "Audit Report",              icon: BarChart3,     step: 5 },
];

function Sidebar({ active, onNav, badge }: { active: ViewKey; onNav: (v: ViewKey) => void; badge: number }) {
  return (
    <aside className="w-52 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      <nav className="flex-1 py-4 px-3 space-y-1">
        {VIEWS.map(v => {
          const Icon = v.icon;
          const isActive = v.key === active;
          return (
            <button
              key={v.key}
              onClick={() => onNav(v.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all group ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-primary/20"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold font-mono transition-colors ${
                isActive ? "bg-sidebar-primary/20 text-sidebar-primary" : "bg-muted/50 text-muted-foreground group-hover:text-sidebar-foreground"
              }`}>
                {v.step}
              </div>
              <span className="flex-1 leading-tight text-xs">{v.label}</span>
              {v.key === "discrepancy" && badge > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-medium">Pipeline Active</span>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">DigiKey API: Connected</div>
        <div className="text-[10px] text-muted-foreground font-mono">v2.4.1 · Build 2025.08</div>
      </div>
    </aside>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────────

function Header({
  isDark, toggleDark, onNomenclature, active, onNav,
}: {
  isDark: boolean;
  toggleDark: () => void;
  onNomenclature: () => void;
  active: ViewKey;
  onNav: (view: ViewKey) => void;
}) {
  const navItems: { label: string; view: ViewKey }[] = [
    { label: "Workspace", view: "upload" },
    { label: "Extraction", view: "extraction" },
    { label: "Validation", view: "discrepancy" },
    { label: "Lifecycle", view: "obsolescence" },
    { label: "Reports", view: "audit" },
  ];

  return (
    <header className="relative z-10 h-16 min-h-[64px] flex items-center px-6 lg:px-12 gap-6 border-b border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground leading-none">
            BOM Validator
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">
            Intelligence for engineering teams
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/10 uppercase tracking-wider">
          Enterprise
        </span>
      </div>

      <nav className="hidden sm:flex items-center gap-3 md:gap-5 mx-auto">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => onNav(item.view)}
            className={`text-[10px] md:text-xs transition-colors ${active === item.view ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Get started</span>
          <span className="md:hidden">Start</span>
        </button>
        <button
          onClick={toggleDark}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          title="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="hidden md:block p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeView, setActiveView] = useState<ViewKey>("upload");
  const [nomenclatureOpen, setNomenclatureOpen] = useState(false);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>(INITIAL_DISCREPANCIES);

  const unresolvedCount = discrepancies.filter(d => d.status === "unresolved").length;

  return (
    <div
      className={`${isDark ? "dark" : ""} h-screen flex flex-col overflow-hidden bg-background text-foreground`}
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        }}
      />

      <NomenclatureModal open={nomenclatureOpen} onClose={() => setNomenclatureOpen(false)} />

      <Header
        isDark={isDark}
        toggleDark={() => setIsDark(d => !d)}
        onNomenclature={() => setNomenclatureOpen(true)}
        active={activeView}
        onNav={setActiveView}
      />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 lg:px-12 max-w-[1500px] mx-auto w-full">
            {activeView === "upload" && (
              <UploadCenter onExtract={() => setActiveView("extraction")} />
            )}
            {activeView === "extraction" && <ExtractionView />}
            {activeView === "discrepancy" && (
              <DiscrepancyView discrepancies={discrepancies} setDiscrepancies={setDiscrepancies} />
            )}
            {activeView === "obsolescence" && <ObsolescenceDashboard />}
            {activeView === "audit" && <AuditSummary discrepancies={discrepancies} />}
          </div>
        </main>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }
        * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
        h1, h2, h3, h4, h5 { font-family: 'Inter', sans-serif; }
        .font-mono, code { font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
}
