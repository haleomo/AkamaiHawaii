import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { canInstallPWA, installPWA } from "@/lib/pwa-utils";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const checkInstallability = () => {
      if (canInstallPWA() && !localStorage.getItem('installPromptDismissed')) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    checkInstallability();
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = () => {
      if (!localStorage.getItem('installPromptDismissed')) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    const success = await installPWA();
    if (success) {
      setShowPrompt(false);
    }
    setInstalling(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed inset-x-4 bottom-20 bg-hawaii-blue text-white border-0 shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-2xl">🌺</span>
              <h4 className="font-medium">Install Akamai Arrival</h4>
            </div>
            <p className="text-sm text-blue-200">Get the app for faster access and offline use</p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="px-3 py-1 text-sm text-blue-200 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleInstall}
              disabled={installing}
              size="sm"
              className="px-3 py-1 bg-white text-hawaii-blue rounded text-sm font-medium hover:bg-gray-100"
            >
              <Download className="w-4 h-4 mr-1" />
              {installing ? 'Installing...' : 'Install'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
