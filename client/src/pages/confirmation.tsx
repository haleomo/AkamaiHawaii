import { useEffect } from "react";
import { CheckCircle, Download, Share, Home, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useFormStore } from "@/lib/form-store";

export default function Confirmation() {
  const [, setLocation] = useLocation();
  const { formData, resetForm } = useFormStore();

  useEffect(() => {
    if (!formData.isSubmitted) {
      setLocation('/');
    }
  }, [formData.isSubmitted, setLocation]);

  const handleNewDeclaration = () => {
    resetForm();
    setLocation('/');
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    console.log('Downloading PDF...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Hawaii Agriculture Declaration Completed',
        text: 'I have successfully completed my Hawaii agriculture declaration form.',
        url: window.location.href,
      });
    }
  };

  if (!formData.isSubmitted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Declaration Submitted!</h1>
          <p className="text-gray-600">Your Hawaii agriculture declaration has been successfully submitted.</p>
        </div>

        {/* Confirmation Details */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-semibold text-gray-900 mb-4">Confirmation Details</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Declaration ID:</span>
                <span className="font-medium">#{formData.declarationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of travelers:</span>
                <span className="font-medium">{formData.numberOfPeople}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items declared:</span>
                <span className="font-medium">
                  {(formData.plantItems.filter(item => item !== 'none-of-above').length + 
                    formData.animalItems.filter(item => item !== 'none-of-above').length)} items
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-semibold text-gray-900 mb-4">What's Next?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-hawaii-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upon Arrival</p>
                  <p className="text-xs text-gray-600">Present this confirmation to agricultural inspectors in the baggage claim area.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-hawaii-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Inspection Process</p>
                  <p className="text-xs text-gray-600">All declared items will be inspected. Items meeting state requirements will be released.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-hawaii-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Enjoy Hawaii</p>
                  <p className="text-xs text-gray-600">Welcome to the beautiful Hawaiian Islands! Enjoy your stay responsibly.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleDownloadPDF}
            className="w-full bg-hawaii-blue hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF Receipt
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="border-hawaii-blue text-hawaii-blue hover:bg-hawaii-light"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleNewDeclaration}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Home className="w-4 h-4 mr-2" />
              New Form
            </Button>
          </div>
        </div>

        {/* Contact Support */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-hawaii-blue" />
              Need Help?
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <Phone className="w-4 h-4 inline mr-2" />
                Hawaii Department of Agriculture: 
                <a href="tel:8088320566" className="text-hawaii-blue font-medium ml-1">(808) 832-0566</a>
              </p>
              <p>
                <Mail className="w-4 h-4 inline mr-2" />
                Email: 
                <a href="mailto:pq.info@hdoa.hawaii.gov" className="text-hawaii-blue font-medium ml-1">pq.info@hdoa.hawaii.gov</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>State of Hawaii Department of Agriculture</p>
          <p>Plant Quarantine Branch</p>
        </div>
      </div>
    </div>
  );
}
