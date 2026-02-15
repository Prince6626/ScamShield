import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Smartphone, ShieldAlert, ArrowLeft, Info, Shield, Lightbulb, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Card className={`shadow-xl border-t-4 ${isScam ? 'border-t-red-500' : 'border-t-green-500'}`}>
          <CardHeader className="bg-white pb-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isScam ? <ShieldAlert className="h-8 w-8 text-red-600" /> : <CheckCircle className="h-8 w-8 text-green-600" />}
                    <div>
                        <CardTitle className="text-2xl">Analysis Result</CardTitle>
                        <CardDescription>AI-Powered Scam Detection</CardDescription>
                    </div>
                </div>
                <Badge variant={isScam ? "destructive" : "success"} className="text-sm px-4 py-1">
                    {result.risk_level.toUpperCase()} RISK
                </Badge>
             </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-8 space-y-8">
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

            {/* Gemini AI Explanation */}
            {result.explanation && (
                <div className="space-y-6">
                    <Separator />
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Detailed Explanation
                    </h3>

                    {/* Why Flagged */}
                    <Card className="border-blue-100 bg-blue-50/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                                <AlertTriangle className="h-4 w-4" />
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
                </div>
            )}

            {/* Action */}
            {isScam && (
                <div className="flex items-center gap-4 p-4 border border-red-100 bg-red-50 rounded-lg text-red-800">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div className="text-sm">
                        <p className="font-semibold">Warning: Do not proceed with payment.</p>
                        <p>Legitimate employers never ask for money for training or equipment before hiring.</p>
                    </div>
                </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 rounded-b-lg p-6 flex justify-between border-t">
            <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {isScam && (
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    Report Scam Pattern
                </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
