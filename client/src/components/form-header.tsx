import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./language-selector";

interface FormHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  showBack: boolean;
}

export function FormHeader({ currentStep, totalSteps, onBack, showBack }: FormHeaderProps) {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <header className="bg-hawaii-blue text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white hover:text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-semibold">Akamai Arrival</h1>
              <p className="text-xs text-blue-200">Hawaii Agriculture Declaration</p>
            </div>
          </div>
          
          <LanguageSelector />
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-200 mt-1">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{progressPercentage}%</span>
          </div>
        </div>
      </div>
    </header>
  );
}
