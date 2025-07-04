import { useEffect, useState } from "react";
import { CheckCircle, Download, Share, Home, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useFormStore } from "@/lib/form-store";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Confirmation() {
  const [, setLocation] = useLocation();
  const { formData, resetForm } = useFormStore();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!formData.isSubmitted) {
      setLocation('/');
    }
  }, [formData.isSubmitted, setLocation]);

  const handleNewDeclaration = () => {
    resetForm();
    setLocation('/');
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Create a temporary container for PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.width = '794px'; // A4 width in pixels at 96 DPI
      pdfContent.style.padding = '40px';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.color = 'black';
      
      // Generate PDF content
      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0066cc; font-size: 24px; margin-bottom: 10px;">Hawaii Agriculture Declaration</h1>
          <h2 style="color: #666; font-size: 18px; margin-bottom: 20px;">Confirmation Receipt</h2>
          <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #0066cc; margin: 0;">
              <strong>Declaration ID: ${formData.declarationId || 'N/A'}</strong>
            </p>
            <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">
              Submitted: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="border-bottom: 2px solid #0066cc; padding-bottom: 5px; color: #0066cc;">Traveler Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%;">Full Name:</td>
              <td style="padding: 8px 0;">${formData.fullName || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Number of Travelers:</td>
              <td style="padding: 8px 0;">${formData.numberOfPeople}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Traveler Type:</td>
              <td style="padding: 8px 0;">${formData.travelerType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Visit Frequency:</td>
              <td style="padding: 8px 0;">${formData.visitFrequency}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="border-bottom: 2px solid #0066cc; padding-bottom: 5px; color: #0066cc;">Arrival Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%;">Arrival Method:</td>
              <td style="padding: 8px 0;">${formData.arrivalMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Arrival Date:</td>
              <td style="padding: 8px 0;">${formData.arrivalDate || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Arrival Port:</td>
              <td style="padding: 8px 0;">${formData.arrivalPort || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Departure Location:</td>
              <td style="padding: 8px 0;">${formData.departureLocation || 'Not provided'}</td>
            </tr>
            ${formData.arrivalMethod === 'flight' ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Flight Number:</td>
              <td style="padding: 8px 0;">${formData.flightNumber || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Airline:</td>
              <td style="padding: 8px 0;">${formData.airline || 'Not provided'}</td>
            </tr>
            ` : ''}
            ${formData.arrivalMethod === 'ship' ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Ship Name:</td>
              <td style="padding: 8px 0;">${formData.shipName || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Shipping Line:</td>
              <td style="padding: 8px 0;">${formData.shippingLine || 'Not provided'}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="border-bottom: 2px solid #0066cc; padding-bottom: 5px; color: #0066cc;">Island Destinations</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%;">Islands Visiting:</td>
              <td style="padding: 8px 0;">${formData.islands.length > 0 ? formData.islands.join(', ') : 'None specified'}</td>
            </tr>
            ${Object.entries(formData.islandNights).length > 0 ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Nights per Island:</td>
              <td style="padding: 8px 0;">
                ${Object.entries(formData.islandNights).map(([island, nights]) => 
                  `${island}: ${nights} nights`
                ).join(', ')}
              </td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="border-bottom: 2px solid #0066cc; padding-bottom: 5px; color: #0066cc;">Plant & Food Items Declaration</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%;">Items Declared:</td>
              <td style="padding: 8px 0;">
                ${formData.plantItems.length > 0 && !formData.plantItems.includes('none-of-above') 
                  ? formData.plantItems.filter(item => item !== 'none-of-above').join(', ') || 'None Declared'
                  : 'None Declared'
                }
              </td>
            </tr>
            ${formData.plantItemsDescription ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Description:</td>
              <td style="padding: 8px 0;">${formData.plantItemsDescription}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="border-bottom: 2px solid #0066cc; padding-bottom: 5px; color: #0066cc;">Animal Declaration</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%;">Items Declared:</td>
              <td style="padding: 8px 0;">
                ${formData.animalItems.length > 0 && !formData.animalItems.includes('none-of-above') 
                  ? formData.animalItems.filter(item => item !== 'none-of-above').join(', ') || 'None Declared'
                  : 'None Declared'
                }
              </td>
            </tr>
            ${formData.animalItemsDescription ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Description:</td>
              <td style="padding: 8px 0;">${formData.animalItemsDescription}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="border-bottom: 2px solid #0066cc; padding-bottom: 5px; color: #0066cc;">Contact Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%;">Phone Number:</td>
              <td style="padding: 8px 0;">${formData.phoneNumber || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Home Address:</td>
              <td style="padding: 8px 0;">${formData.homeAddress || 'Not provided'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="border-bottom: 2px solid #0066cc; padding-bottom: 5px; color: #0066cc;">Hawaii Address</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%;">Hawaii Address:</td>
              <td style="padding: 8px 0;">
                ${formData.sameAsHomeAddress 
                  ? 'Same as home address' 
                  : formData.hawaiiAddress || 'Not provided'
                }
              </td>
            </tr>
          </table>
        </div>

        <div style="border-top: 2px solid #0066cc; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="font-size: 12px; color: #666; margin: 0;">
            This declaration was submitted in compliance with Hawaii Department of Agriculture regulations.
          </p>
          <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">
            Keep this receipt for your records during your stay in Hawaii.
          </p>
        </div>
      `;

      // Temporarily add to DOM for rendering
      document.body.appendChild(pdfContent);

      // Convert to canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Remove from DOM
      document.body.removeChild(pdfContent);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Download PDF
      const fileName = `hawaii-declaration-${formData.declarationId || 'receipt'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
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
                  {(() => {
                    const plantItemsCount = formData.plantItems.filter(item => item !== 'none-of-above').length;
                    const animalItemsCount = formData.animalItems.filter(item => item !== 'none-of-above').length;
                    const totalItemsCount = plantItemsCount + animalItemsCount;
                    
                    // If no actual items are declared (excluding none-of-above), show "None Declared"
                    if (totalItemsCount === 0) {
                      return "None Declared";
                    }
                    
                    return `${totalItemsCount} items`;
                  })()}
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
            disabled={isGeneratingPDF}
            className="w-full bg-hawaii-blue hover:bg-blue-700 text-white disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Receipt'}
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
