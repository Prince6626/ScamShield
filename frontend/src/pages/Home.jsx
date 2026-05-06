import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Image as ImageIcon, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          Detect Job Scams with <span className="text-blue-600">AI Precision</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Protect yourself from fraudulent job offers. Analyze job descriptions and screenshots instantly with our advanced machine learning models.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/text">
            <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700">
              Start Analysis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/image">
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
              Upload Screenshot
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <FeatureCard
          icon={<FileText className="h-10 w-10 text-blue-500" />}
          title="Text Analysis"
          description="Paste any job description to get an instant scam probability score using NLP."
        />
        <FeatureCard
          icon={<ImageIcon className="h-10 w-10 text-purple-500" />}
          title="Image Recognition"
          description="Upload screenshots of job posts. We extract text via OCR and analyze it."
        />
        <FeatureCard
          icon={<ShieldAlert className="h-10 w-10 text-red-500" />}
          title="Risk Assessment"
          description="Get detailed risk levels (Low, Medium, High) and explanations for every scan."
        />
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-slate-200">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
