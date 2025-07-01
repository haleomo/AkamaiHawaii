import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canProceed: boolean;
  isSubmitting?: boolean;
}

export function FormNavigation({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  canProceed,
  isSubmitting = false 
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isFinalStep = currentStep === totalSteps;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="flex items-center space-x-2 px-4 py-2 text-hawaii-blue font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentStep ? 'bg-hawaii-blue' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <Button
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className="flex items-center space-x-2 px-6 py-2 bg-hawaii-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <span>{isFinalStep ? 'Submit Declaration' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </footer>
  );
}
