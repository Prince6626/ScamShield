import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, CheckCircle, ShieldAlert, ArrowLeft, Info, Shield, 
  Lightbulb, ExternalLink, Mail, Globe, MessageCircle, Link2, 
  Activity, Bot, Cpu, Flag, Building2, Search
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Score Ring Component ──────────────────────────────────────────────────
function ScoreRing({ score, label, color, delay = 0 }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r={radius} fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: delay + 0.2, duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-900">{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500 text-center">{label}</span>
    </motion.div>
  );
}

// ─── Risk Category Card ────────────────────────────────────────────────────
function RiskCategory({ icon: Icon, title, score, maxScore, color, bgColor, borderColor }) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const riskLabel = percentage > 60 ? "High" : percentage > 30 ? "Medium" : "Low";
  const riskBadge = percentage > 60 ? "destructive" : percentage > 30 ? "secondary" : "outline";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`p-4 rounded-lg border ${borderColor} ${bgColor} transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${color}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800">{title}</span>
          </div>
          <Badge variant={riskBadge} className="text-xs">
            {riskLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={percentage} className="h-2 flex-1" indicatorColor={
            percentage > 60 ? "bg-red-500" : percentage > 30 ? "bg-amber-500" : "bg-emerald-500"
          } />
          <span className="text-xs font-mono text-slate-500 w-12 text-right">{score}/{maxScore}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Result Component ─────────────────────────────────────────────────
export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};

  if (!result) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">No result found</h2>
            <Link to="/"><Button>Go Home</Button></Link>
        </div>
    )
  }

  const isScam = result.prediction === "Scam";
  const probability = (result.scam_probability * 100).toFixed(1);
  const riskColor = isScam ? "text-red-600" : "text-green-600";
  const riskBg = isScam ? "bg-red-50" : "bg-green-50";
  const progressColor = isScam ? "bg-red-600" : "bg-green-600";

  // New pipeline scores (fallback to legacy if not present)
  const mlScore = result.ml_score ?? Math.round(result.scam_probability * 100);
  const verificationScore = result.verification_score ?? 0;
  const geminiScore = result.gemini_score ?? 0;
  const finalScore = result.final_score ?? Math.round(result.scam_probability * 100);
  const risk = result.risk ?? result.risk_level;
  const flags = result.flags ?? [];

  // Sub-scores
  const emailScore = result.email_score ?? 0;
  const urlScore = result.url_score ?? 0;
  const contactScore = result.contact_score ?? 0;
  const consistencyScore = result.consistency_score ?? 0;

  // Final risk color
  const finalRiskColor = finalScore > 70 ? "text-red-600" : finalScore > 40 ? "text-amber-600" : "text-emerald-600";
  const finalRiskBg = finalScore > 70 ? "from-red-500 to-rose-600" : finalScore > 40 ? "from-amber-500 to-orange-600" : "from-emerald-500 to-green-600";

  const webVerification = result.website_verification;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-6"
      >
        {/* ── Final Score Hero ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`shadow-xl border-0 overflow-hidden`}>
            <div className={`bg-gradient-to-r ${finalRiskBg} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {finalScore > 70 ? (
                    <ShieldAlert className="h-10 w-10 opacity-90" />
                  ) : finalScore > 40 ? (
                    <AlertTriangle className="h-10 w-10 opacity-90" />
                  ) : (
                    <CheckCircle className="h-10 w-10 opacity-90" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">Analysis Complete</h1>
                    <p className="text-sm opacity-80">Detection + Verification Pipeline</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black">{finalScore}</div>
                  <div className="text-sm opacity-80 font-medium">{risk} Risk</div>
                </div>
              </div>
            </div>

            {/* ── Score Breakdown Rings ─────────────────────────────── */}
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 py-4">
                <ScoreRing score={mlScore} label="ML Detection" color="#3b82f6" delay={0} />
                <ScoreRing score={verificationScore} label="Verification" color="#f59e0b" delay={0.15} />
                <ScoreRing score={geminiScore} label="Gemini AI" color="#8b5cf6" delay={0.3} />
              </div>
              <div className="text-center mt-2">
                <p className="text-xs text-slate-400">
                  Final = 50% ML + 30% Verification + 20% Gemini
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Verification Breakdown ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Verification Breakdown
              </CardTitle>
              <CardDescription>Rule-based analysis of email, website, contact methods, and data consistency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <RiskCategory
                icon={Mail}
                title="Email Risk"
                score={emailScore}
                maxScore={55}
                color="bg-blue-500"
                bgColor="bg-blue-50/50"
                borderColor="border-blue-100"
              />
              <RiskCategory
                icon={Globe}
                title="Website Risk"
                score={urlScore}
                maxScore={65}
                color="bg-purple-500"
                bgColor="bg-purple-50/50"
                borderColor="border-purple-100"
              />
              <RiskCategory
                icon={MessageCircle}
                title="Contact Risk"
                score={contactScore}
                maxScore={55}
                color="bg-amber-500"
                bgColor="bg-amber-50/50"
                borderColor="border-amber-100"
              />
              <RiskCategory
                icon={Link2}
                title="Consistency Check"
                score={consistencyScore}
                maxScore={30}
                color="bg-rose-500"
                bgColor="bg-rose-50/50"
                borderColor="border-rose-100"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Website Verification ─────────────────────────────────── */}
        {webVerification && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="shadow-lg border-indigo-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                  <Search className="h-5 w-5" />
                  Website Verification
                </CardTitle>
                <CardDescription>Automated domain analysis and company verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Info */}
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-md shrink-0">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Company Name</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {webVerification.company || "Unknown"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Website Info */}
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-md shrink-0">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Website URL</p>
                      <p className="text-sm font-semibold text-slate-800 break-all">
                        {webVerification.url || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Flags */}
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-slate-500 font-medium">Risk Analysis Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Live Status Chip */}
                    {webVerification.url && (
                      <Badge 
                        variant="outline" 
                        className={`px-3 py-1.5 text-xs ${webVerification.website_live ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}
                      >
                        {webVerification.website_live ? <CheckCircle className="h-3 w-3 mr-1.5" /> : <AlertTriangle className="h-3 w-3 mr-1.5" />}
                        {webVerification.website_live ? "Website is Live" : "Website Not Reachable"}
                      </Badge>
                    )}
                    
                    {/* Other flags */}
                    {webVerification.flags && webVerification.flags.map((flag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="px-3 py-1.5 text-xs border-amber-200 bg-amber-50 text-amber-800"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1.5" />
                        {flag}
                      </Badge>
                    ))}
                    
                    {!webVerification.url && (!webVerification.flags || webVerification.flags.length === 0) && (
                      <Badge variant="outline" className="px-3 py-1.5 text-xs border-slate-200 bg-slate-50 text-slate-500">
                        No additional flags
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Flags ──────────────────────────────────────────────── */}
        {flags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg border-amber-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                  <Flag className="h-5 w-5" />
                  Detected Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {flags.map((flag, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                    >
                      <Badge
                        variant="outline"
                        className="px-3 py-1.5 text-sm border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1.5" />
                        {flag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Legacy Details ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className={`shadow-lg border-t-4 ${isScam ? 'border-t-red-500' : 'border-t-green-500'}`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-slate-600" />
                ML Analysis Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scam Meter */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-slate-500">Scam Probability</span>
                    <span className={`text-3xl font-bold ${riskColor}`}>{probability}%</span>
                </div>
                <Progress value={parseFloat(probability)} className="h-3" indicatorColor={progressColor} />
                <p className="text-sm text-slate-600">
                    {isScam 
                        ? "This job post exhibits high-risk patterns often associated with fraudulent schemes." 
                        : "This job post appears legitimate based on our analysis."}
                </p>
              </div>

              {/* Details */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Analysis Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500 block">Prediction</span>
                        <span className="font-medium text-slate-900">{result.prediction}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Risk Level</span>
                        <span className="font-medium text-slate-900">{result.risk_level}</span>
                    </div>
                </div>
                
                {result.extracted_text && (
                    <div className="mt-4">
                        <span className="text-slate-500 block mb-1">Extracted Text (OCR)</span>
                        <div className="bg-white p-3 rounded border text-xs text-slate-700 max-h-32 overflow-y-auto font-mono">
                            {result.extracted_text}
                        </div>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Gemini AI Explanation ─────────────────────────────── */}
        {result.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-violet-600" />
                  Gemini AI Explanation
                </CardTitle>
                <CardDescription>Detailed analysis powered by Google Gemini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Why Flagged */}
                <Card className="border-blue-100 bg-blue-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                            <Info className="h-4 w-4" />
                            Why This Was Flagged
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-blue-800">{result.explanation.reason}</p>
                    </CardContent>
                </Card>

                {/* Scam Signals */}
                {result.explanation.signals && result.explanation.signals.length > 0 && (
                    <Card className="border-red-100 bg-red-50/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2 text-red-900">
                                <ShieldAlert className="h-4 w-4" />
                                Scam Signals Detected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {result.explanation.signals.map((signal, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                                        <Badge variant="destructive" className="mt-0.5 shrink-0 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                            {idx + 1}
                                        </Badge>
                                        <span>{signal}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Safety Tips */}
                {result.explanation.tips && result.explanation.tips.length > 0 && (
                    <Card className="border-green-100 bg-green-50/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2 text-green-900">
                                <Shield className="h-4 w-4" />
                                Safety Tips for Students
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {result.explanation.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                                        <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Verification Steps */}
                {result.explanation.verification && result.explanation.verification.length > 0 && (
                    <Card className="border-purple-100 bg-purple-50/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2 text-purple-900">
                                <ExternalLink className="h-4 w-4" />
                                Verification Steps
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {result.explanation.verification.map((step, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                                        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-purple-600" />
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Warning Banner ─────────────────────────────────────── */}
        {isScam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-4 p-4 border border-red-200 bg-red-50 rounded-lg text-red-800">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="text-sm">
                    <p className="font-semibold">Warning: Do not proceed with payment.</p>
                    <p>Legitimate employers never ask for money for training or equipment before hiring.</p>
                </div>
            </div>
          </motion.div>
        )}

        {/* ── Footer Actions ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex justify-between pb-8"
        >
          <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {isScam && (
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  Report Scam Pattern
              </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
