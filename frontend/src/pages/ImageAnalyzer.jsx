import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImageAnalyzer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      // Create preview URL
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze-image', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Navigate to result page with state
      navigate('/result', { state: { result: response.data, imagePreview: preview } });
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
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
                <div className="p-2 bg-purple-100 rounded-lg">
                    <ImageIcon className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Screenshot Analyzer</CardTitle>
            </div>
            <CardDescription className="text-base">
                Upload a screenshot of the job posting. We use OCR to extract text and detect scams.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    {preview ? (
                         <img src={preview} alt="Preview" className="h-full w-full object-contain p-2" />
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-4 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500 font-medium">Click to upload screenshot</p>
                            <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                        </div>
                    )}
                    <Input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
            </div>
            
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
                className="bg-purple-600 hover:bg-purple-700 min-w-[150px]"
                onClick={handleAnalyze}
                disabled={loading || !file}
            >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Analyze Image"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
