import { useEffect, useState } from "react";
import { CheckCircle, Download, Share, Home, Phone, Mail, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useFormStore } from "@/lib/form-store";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

export default function Confirmation() {
  const [, setLocation] = useLocation();
  const { formData, resetForm } = useFormStore();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  useEffect(() => {
    if (!formData.isSubmitted) {
      setLocation('/');
    }
  }, [formData.isSubmitted, setLocation]);

  // Generate QR code when component loads
  useEffect(() => {
    if (formData.isSubmitted && formData.declarationId) {
      generateQRCode();
    }
  }, [formData.isSubmitted, formData.declarationId]);

  const generateQRCode = async () => {
    try {
      // Count total items declared (excluding "none-of-above")
      const plantItemsCount = formData.plantItems.filter(item => item !== 'none-of-above').length;
      const animalItemsCount = formData.animalItems.filter(item => item !== 'none-of-above').length;
      const totalItemsCount = plantItemsCount + animalItemsCount;

      // Create QR code data
      const qrData = {
        declarationId: formData.declarationId,
        submittedAt: new Date().toISOString(),
        itemsCount: totalItemsCount,
        travelerName: formData.fullName,
        arrivalDate: formData.arrivalDate
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0066cc',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataURL(qrCodeURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleNewDeclaration = () => {
    resetForm();
    setLocation('/');
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Generate QR code specifically for PDF
      const plantItemsCount = formData.plantItems.filter(item => item !== 'none-of-above').length;
      const animalItemsCount = formData.animalItems.filter(item => item !== 'none-of-above').length;
      const totalItemsCount = plantItemsCount + animalItemsCount;

      const qrData = {
        declarationId: formData.declarationId,
        submittedAt: new Date().toISOString(),
        itemsCount: totalItemsCount,
        travelerName: formData.fullName,
        arrivalDate: formData.arrivalDate
      };

      const qrString = JSON.stringify(qrData);
      const pdfQrCode = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0066cc',
          light: '#FFFFFF'
        }
      });

      // Create PDF directly using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 6;
      
      // Header
      pdf.setTextColor(0, 102, 204); // Hawaii blue
      pdf.setFontSize(20);
      pdf.text('Hawaii Agriculture Declaration', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      pdf.setFontSize(16);
      pdf.text('Confirmation Receipt', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Declaration ID box
      pdf.setFontSize(14);
      pdf.text(`Declaration ID: ${formData.declarationId || 'N/A'}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      pdf.text(`Submitted: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Section: Traveler Information
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(12);
      pdf.text('Traveler Information', margin, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(`Full Name: ${formData.fullName || 'Not provided'}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Number of Travelers: ${formData.numberOfPeople}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Traveler Type: ${formData.travelerType}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Visit Frequency: ${formData.visitFrequency}`, margin, yPosition);
      yPosition += 12;
      
      // Section: Arrival Information
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(12);
      pdf.text('Arrival Information', margin, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(`Arrival Method: ${formData.arrivalMethod}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Arrival Date: ${formData.arrivalDate || 'Not provided'}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Arrival Port: ${formData.arrivalPort || 'Not provided'}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Departure Location: ${formData.departureLocation || 'Not provided'}`, margin, yPosition);
      yPosition += lineHeight;
      
      if (formData.arrivalMethod === 'flight') {
        pdf.text(`Flight Number: ${formData.flightNumber || 'Not provided'}`, margin, yPosition);
        yPosition += lineHeight;
        pdf.text(`Airline: ${formData.airline || 'Not provided'}`, margin, yPosition);
        yPosition += lineHeight;
      }
      
      if (formData.arrivalMethod === 'ship') {
        pdf.text(`Ship Name: ${formData.shipName || 'Not provided'}`, margin, yPosition);
        yPosition += lineHeight;
        pdf.text(`Shipping Line: ${formData.shippingLine || 'Not provided'}`, margin, yPosition);
        yPosition += lineHeight;
      }
      yPosition += 6;
      
      // Section: Island Destinations
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(12);
      pdf.text('Island Destinations', margin, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(`Islands Visiting: ${formData.islands.length > 0 ? formData.islands.join(', ') : 'None specified'}`, margin, yPosition);
      yPosition += lineHeight;
      
      if (Object.entries(formData.islandNights).length > 0) {
        const nightsText = Object.entries(formData.islandNights).map(([island, nights]) => `${island}: ${nights} nights`).join(', ');
        pdf.text(`Nights per Island: ${nightsText}`, margin, yPosition);
        yPosition += lineHeight;
      }
      yPosition += 6;
      
      // Section: Plant & Food Items
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(12);
      pdf.text('Plant & Food Items Declaration', margin, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      const plantItems = formData.plantItems.length > 0 && !formData.plantItems.includes('none-of-above') 
        ? formData.plantItems.filter(item => item !== 'none-of-above').join(', ') || 'None Declared'
        : 'None Declared';
      pdf.text(`Items Declared: ${plantItems}`, margin, yPosition);
      yPosition += lineHeight;
      
      if (formData.plantItemsDescription) {
        pdf.text(`Description: ${formData.plantItemsDescription}`, margin, yPosition);
        yPosition += lineHeight;
      }
      yPosition += 6;
      
      // Section: Animal Declaration
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(12);
      pdf.text('Animal Declaration', margin, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      const animalItems = formData.animalItems.length > 0 && !formData.animalItems.includes('none-of-above') 
        ? formData.animalItems.filter(item => item !== 'none-of-above').join(', ') || 'None Declared'
        : 'None Declared';
      pdf.text(`Items Declared: ${animalItems}`, margin, yPosition);
      yPosition += lineHeight;
      
      if (formData.animalItemsDescription) {
        pdf.text(`Description: ${formData.animalItemsDescription}`, margin, yPosition);
        yPosition += lineHeight;
      }
      yPosition += 6;
      
      // Section: Contact Information
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(12);
      pdf.text('Contact Information', margin, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(`Phone Number: ${formData.phoneNumber || 'Not provided'}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Home Address: ${formData.homeAddress || 'Not provided'}`, margin, yPosition);
      yPosition += 12;
      
      // Section: Hawaii Address
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(12);
      pdf.text('Hawaii Address', margin, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      const hawaiiAddress = formData.sameAsHomeAddress ? 'Same as home address' : formData.hawaiiAddress || 'Not provided';
      pdf.text(`Hawaii Address: ${hawaiiAddress}`, margin, yPosition);
      yPosition += 15;
      
      // QR Code section
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(12);
      pdf.text('Quick Reference QR Code', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      // Add QR code image
      const qrSize = 30;
      const qrX = (pageWidth - qrSize) / 2;
      pdf.addImage(pdfQrCode, 'PNG', qrX, yPosition, qrSize, qrSize);
      yPosition += qrSize + 8;
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text('Scan for quick access to declaration details', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Footer
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      pdf.text('This declaration was submitted in compliance with Hawaii Department of Agriculture regulations.', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      pdf.text('Keep this receipt for your records during your stay in Hawaii.', pageWidth / 2, yPosition, { align: 'center' });
      
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

        {/* QR Code Section */}
        {qrCodeDataURL && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="font-semibold text-gray-900 mb-2 flex items-center justify-center">
                  <QrCode className="w-5 h-5 mr-2 text-hawaii-blue" />
                  Quick Reference QR Code
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this code for quick access to your declaration details
                </p>
                
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img 
                      src={qrCodeDataURL} 
                      alt="Declaration QR Code" 
                      className="w-40 h-40"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Declaration ID:</strong> {formData.declarationId}</p>
                  <p><strong>Items Declared:</strong> {(() => {
                    const plantItemsCount = formData.plantItems.filter(item => item !== 'none-of-above').length;
                    const animalItemsCount = formData.animalItems.filter(item => item !== 'none-of-above').length;
                    const totalItemsCount = plantItemsCount + animalItemsCount;
                    return totalItemsCount === 0 ? 'None' : totalItemsCount;
                  })()}</p>
                  <p><strong>Submitted:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
