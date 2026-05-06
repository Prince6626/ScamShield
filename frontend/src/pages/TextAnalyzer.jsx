import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TextAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze-text', { text });
      // Navigate to result page with state
      navigate('/result', { state: { result: response.data } });
    } catch (err) {
      setError("Failed to analyze. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="bg-white rounded-t-lg border-b pb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Job Text Analyzer</CardTitle>
            </div>
            <CardDescription className="text-base">
              Paste the job description or email content below. Our AI will analyze patterns to detect potential scams.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Textarea
              placeholder="Paste job description here..."
              className="min-h-[300px] text-base p-4 resize-none bg-slate-50 focus:bg-white transition-colors"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 rounded-b-lg p-6 flex justify-between border-t">
            <Button variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Analyze Text"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
