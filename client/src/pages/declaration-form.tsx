import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Info, CheckCircle, Leaf, Fish, MapPin, Users, Phone, Globe, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FormHeader } from "@/components/form-header";
import { FormNavigation } from "@/components/form-navigation";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { useFormStore } from "@/lib/form-store";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { getLocationBasedGreeting, formatLocalTime } from "@/lib/location-greeting";

const TOTAL_STEPS = 9;

const hawaiianIslands = [
  { id: 'oahu', name: 'Oʻahu (Honolulu)', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80&v=2' }, // Diamond Head crater authentic
  { id: 'maui', name: 'Maui', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80&v=2' }, // Haleakala crater authentic
  { id: 'hawaii', name: 'Hawaiʻi (Big Island)', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80&v=2' }, // Active volcano authentic
  { id: 'kauai', name: 'Kauaʻi', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80&v=2' }, // Na Pali Coast authentic
  { id: 'molokai', name: 'Molokaʻi', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80&v=2' }, // Sea cliffs authentic
  { id: 'lanai', name: 'Lānaʻi', image: 'https://images.unsplash.com/photo-1566133070146-6b5660b2e83a?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80&v=2' }, // Garden of Gods authentic
];

const plantItems = [
  { id: 'fruits-vegetables', name: 'Fresh Fruit & Vegetables', icon: '🥬', description: 'Fresh, unprocessed fruits and vegetables' },
  { id: 'flowers-foliage', name: 'Cut Flowers & Foliage', icon: '🌺', description: 'Fresh flowers, lei, plant decorations' },
  { id: 'plants-cuttings', name: 'Rooted Plants & Plant Cuttings', icon: '🌱', description: 'Live plants, cuttings, or algae cultures' },
  { id: 'seeds-bulbs', name: 'Raw or Propagative Seeds', icon: '🌰', description: 'Unprocessed seeds, bulbs for planting' },
  { id: 'soil-media', name: 'Soil, Growing Media, Sand', icon: '🪨', description: 'Dirt, potting soil, sand, growing medium' },
  { id: 'microorganisms', name: 'Microorganism Cultures', icon: '🦠', description: 'Bacterial, fungal, viral, or protozoa cultures' },
  { id: 'none-of-above', name: 'None of Above', icon: '❌', description: 'I am not carrying any plant or food items' },
];

const animalItems = [
  { id: 'dogs', name: 'Dogs', icon: '🐕', description: 'Domestic dogs (must notify cabin attendant)' },
  { id: 'cats', name: 'Cats', icon: '🐱', description: 'Domestic cats (must notify cabin attendant)' },
  { id: 'birds', name: 'Birds', icon: '🐦', description: 'All bird species (must notify cabin attendant)' },
  { id: 'seafood', name: 'Live Seafood', icon: '🦞', description: 'Lobsters, clams, oysters, live fish' },
  { id: 'reptiles', name: 'Reptiles', icon: '🦎', description: 'Turtles, lizards, snakes (PROHIBITED)' },
  { id: 'other-animals', name: 'Other Animals', icon: '🐾', description: 'Insects, amphibians, other live animals' },
  { id: 'none-of-above', name: 'None of Above', icon: '❌', description: 'I am not traveling with any live animals' },
];

export default function DeclarationForm() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [greeting, setGreeting] = useState(getLocationBasedGreeting());
  const [currentTime, setCurrentTime] = useState(formatLocalTime());

  // Create or get declaration
  const { data: declaration, isLoading } = useQuery({
    queryKey: ['/api/declarations', formData.declarationId],
    queryFn: async () => {
      if (formData.declarationId) {
        const response = await fetch(`/api/declarations/${formData.declarationId}`);
        if (response.ok) {
          return response.json();
        }
      }
      // Create new declaration
      const response = await apiRequest('POST', '/api/declarations', {
        numberOfPeople: formData.numberOfPeople,
        travelerType: formData.travelerType || 'visitor',
        visitFrequency: formData.visitFrequency || '1st',
        duration: formData.duration || 'overnight',
        arrivalMethod: formData.arrivalMethod || 'flight',
        islands: formData.islands,
        islandNights: formData.islandNights,
        plantItems: formData.plantItems,
        animalItems: formData.animalItems,
        language: formData.language,
      });
      const newDeclaration = await response.json();
      updateFormData({ declarationId: newDeclaration.id });
      return newDeclaration;
    },
  });

  // Update declaration mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!formData.declarationId) throw new Error('No declaration ID');
      return apiRequest('PATCH', `/api/declarations/${formData.declarationId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/declarations', formData.declarationId] });
    },
  });

  // Submit declaration mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!formData.declarationId) throw new Error('No declaration ID');
      return apiRequest('POST', `/api/declarations/${formData.declarationId}/submit`, data);
    },
    onSuccess: () => {
      updateFormData({ isSubmitted: true });
      setLocation('/confirmation');
      toast({
        title: "Declaration Submitted Successfully!",
        description: "You will receive a confirmation email shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Update greeting and time periodically
  useEffect(() => {
    const updateGreetingAndTime = () => {
      setGreeting(getLocationBasedGreeting());
      setCurrentTime(formatLocalTime());
    };

    // Update every minute
    const interval = setInterval(updateGreetingAndTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleNext = async () => {
    console.log('[DEBUG] handleNext - Current step:', formData.currentStep);
    console.log('[DEBUG] handleNext - Form data:', formData);
    
    if (formData.currentStep < TOTAL_STEPS) {
      // Handle step 7 (Contact Information) specially - create/update user
      if (formData.currentStep === 7) {
        const stepData = getStepData();
        console.log('[DEBUG] handleNext - User data for step 7:', stepData);
        
        if (stepData) {
          try {
            console.log('[DEBUG] handleNext - Creating/updating user');
            const userResponse = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(stepData)
            });
            
            if (!userResponse.ok) {
              throw new Error('Failed to save user information');
            }
            
            const user = await userResponse.json();
            console.log('[DEBUG] handleNext - User saved:', user);
            
            // Now link the user to the declaration
            if (formData.declarationId) {
              console.log('[DEBUG] handleNext - Linking user to declaration');
              await updateMutation.mutateAsync({ userId: user.id });
              console.log('[DEBUG] handleNext - User linked to declaration');
            }
          } catch (error) {
            console.error('[DEBUG] handleNext - User save error:', error);
            toast({
              title: "Error Saving Information", 
              description: "Please check your contact information and try again",
              variant: "destructive"
            });
            return;
          }
        }
      } else {
        // Regular step handling for other steps
        const stepData = getStepData();
        console.log('[DEBUG] handleNext - Step data:', stepData);
        
        if (stepData && formData.declarationId) {
          try {
            console.log('[DEBUG] handleNext - Updating declaration with ID:', formData.declarationId);
            await updateMutation.mutateAsync(stepData);
            console.log('[DEBUG] handleNext - Update successful');
          } catch (error) {
            console.error('[DEBUG] handleNext - Update error:', error);
            toast({
              title: "Validation Error", 
              description: "Please check your entries and try again",
              variant: "destructive"
            });
            return;
          }
        }
      }
      
      setCurrentStep(formData.currentStep + 1);
      console.log('[DEBUG] handleNext - Moving to step:', formData.currentStep + 1);
    } else {
      // Submit form
      try {
        console.log('[DEBUG] handleNext - Submitting final form');
        await submitMutation.mutateAsync({
          certificationAccepted: true,
          inspectionUnderstood: true,
        });
        console.log('[DEBUG] handleNext - Submission successful');
      } catch (error) {
        console.error('[DEBUG] handleNext - Submission error:', error);
      }
    }
  };

  const handlePrevious = () => {
    if (formData.currentStep > 1) {
      setCurrentStep(formData.currentStep - 1);
    }
  };

  const getStepData = () => {
    switch (formData.currentStep) {
      case 2:
        return {
          numberOfPeople: formData.numberOfPeople,
          travelerType: formData.travelerType,
          visitFrequency: formData.visitFrequency,
          duration: formData.duration,
        };
      case 3:
        console.log('Arrivale Date:', formData.arrivalDate);
        return {
          arrivalMethod: formData.arrivalMethod,
          flightNumber: formData.flightNumber,
          airline: formData.airline,
          shipName: formData.shipName,
          shippingLine: formData.shippingLine,
          arrivalDate: formData.arrivalDate ? new Date(formData.arrivalDate) : undefined,
          arrivalPort: formData.arrivalPort,
          departureLocation: formData.departureLocation,
        };
      case 4:
        return {
          islands: formData.islands,
          islandNights: formData.islandNights,
        };
      case 5:
        return {
          plantItems: formData.plantItems,
          plantItemsDescription: formData.plantItemsDescription,
        };
      case 6:
        return {
          animalItems: formData.animalItems,
          animalItemsDescription: formData.animalItemsDescription,
        };
      case 7:
        return {
          fullName: formData.fullName,
          homeAddress: formData.homeAddress,
          phoneNumber: formData.phoneNumber,
        };
      case 8:
        return {
          hawaiiAddress: formData.hawaiiAddress,
          sameAsHomeAddress: formData.sameAsHomeAddress,
        };
      default:
        return null;
    }
  };

  const canProceed = (): boolean => {
    switch (formData.currentStep) {
      case 1:
        return true;
      case 2:
        // Visit frequency is only required for visitors and people moving to Hawaii
        const visitFrequencyRequired = (formData.travelerType === 'visitor' || formData.travelerType === 'moving') 
          ? Boolean(formData.visitFrequency) 
          : true;
        // Duration is only required for visitors and people moving to Hawaii
        const durationRequired = (formData.travelerType === 'visitor' || formData.travelerType === 'moving')
          ? Boolean(formData.duration)
          : true;
        return Boolean(formData.numberOfPeople > 0 && formData.travelerType && visitFrequencyRequired && durationRequired);
      case 3:
        if (formData.arrivalMethod === 'flight') {
          console.log('flight %s airline %s departure %s', formData.flightNumber, formData.airline, formData.departureLocation);
          // For flights, departure location is optional
          return Boolean(formData.flightNumber && formData.airline);
        }
        if (formData.arrivalMethod === 'ship') {
          // For ships, departure location is required
          return Boolean(formData.shipName && formData.departureLocation);
        }
        // For other methods, departure location is required
        return Boolean(formData.arrivalMethod && formData.departureLocation);
      case 4:
        return formData.islands.length > 0;
      case 5:
        // Allow proceed if no items selected, "None of Above" selected, or description provided for other items
        return formData.plantItems.length === 0 || 
               formData.plantItems.includes('none-of-above') || 
               formData.plantItemsDescription.trim().length > 0;
      case 6:
        // Allow proceed if no items selected, "None of Above" selected, or description provided for other items
        return formData.animalItems.length === 0 || 
               formData.animalItems.includes('none-of-above') || 
               formData.animalItemsDescription.trim().length > 0;
      case 7:
        return Boolean(formData.fullName?.trim() && formData.homeAddress?.trim() && formData.phoneNumber?.trim());
      case 8:
        // Hawaii address validation - either same as home address or valid hawaii address provided
        return formData.sameAsHomeAddress || Boolean(formData.hawaiiAddress?.trim() && formData.hawaiiAddress.trim().length >= 5);
      case 9:
        return true;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hawaii-blue mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading declaration form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FormHeader
        currentStep={formData.currentStep}
        totalSteps={TOTAL_STEPS}
        onBack={handlePrevious}
        showBack={formData.currentStep > 1}
      />

      <main className="max-w-md mx-auto px-4 pb-20">
        {/* Step 1: Welcome & Legal Notice */}
        {formData.currentStep === 1 && (
          <div className="py-6 space-y-6">
            <Card className="border-gray-100">
              <CardContent className="pt-6">
                <img
                  src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
                  alt="Tropical Hawaiian beach with palm trees and turquoise waters"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{greeting.greeting}</h2>
                  <p className="text-sm text-gray-500 mb-3 flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    Local time: {currentTime}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    {greeting.description}
                  </p>
                  <p className="text-hawaii-blue text-sm font-medium">
                    {greeting.timeContext}
                  </p>
                </div>
                
                <div className="bg-hawaii-light border border-hawaii-blue/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-hawaii-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-hawaii-blue">Required by State Law</p>
                      <p className="text-xs text-gray-600 mt-1">All passengers must complete this declaration form. One adult may complete for family members.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Legal Warning Card */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Legal Penalties</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• False information: Up to <strong>$25,000 fine</strong> and/or 1 year imprisonment</li>
                      <li>• Smuggling prohibited items: Up to <strong>$200,000 fine</strong> and/or 5 years imprisonment</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Offline Capability Notice */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Works Offline</p>
                    <p className="text-xs text-green-700">Complete this form without internet connection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Drafts Navigation */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Saved Drafts</p>
                      <p className="text-xs text-blue-700">Continue a previously started form</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/drafts')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    View Drafts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Traveler Information */}
        {formData.currentStep === 2 && (
          <div className="py-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-hawaii-blue" />
                  Traveler Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700 mb-2">
                      Total number of people covered by this form <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.numberOfPeople.toString()} 
                      onValueChange={(value) => updateFormData({ numberOfPeople: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num === 6 ? '6+' : num.toString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-3">
                      I am a <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup 
                      value={formData.travelerType} 
                      onValueChange={(value) => {
                        updateFormData({ travelerType: value as any });
                        // Clear visit frequency and duration when switching to resident since they're not required
                        if (value === 'resident') {
                          updateFormData({ visitFrequency: '', duration: '' });
                        }
                      }}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="visitor" id="visitor" />
                        <Label htmlFor="visitor" className="text-sm text-gray-700 cursor-pointer">Visitor to Hawaiʻi</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="resident" id="resident" />
                        <Label htmlFor="resident" className="text-sm text-gray-700 cursor-pointer">Returning Hawaiʻi resident</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="moving" id="moving" />
                        <Label htmlFor="moving" className="text-sm text-gray-700 cursor-pointer">Moving to Hawaiʻi (intended resident for 1+ year)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Only show visit frequency for visitors and people moving to Hawaii */}
                  {(formData.travelerType === 'visitor' || formData.travelerType === 'moving') && (
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        This trip to Hawaiʻi is my <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.visitFrequency} 
                        onValueChange={(value) => updateFormData({ visitFrequency: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select visit frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">1st visit</SelectItem>
                          <SelectItem value="2nd">2nd visit</SelectItem>
                          <SelectItem value="3rd">3rd visit</SelectItem>
                          <SelectItem value="4th">4th visit</SelectItem>
                          <SelectItem value="5th">5th visit</SelectItem>
                          <SelectItem value="6-10">6-10 visits</SelectItem>
                          <SelectItem value="10+">10+ visits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Only show duration for visitors and people moving to Hawaii */}
                  {(formData.travelerType === 'visitor' || formData.travelerType === 'moving') && (
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-3">
                        I will be in the Hawaiian Islands for <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup 
                        value={formData.duration} 
                        onValueChange={(value) => updateFormData({ duration: value as any })}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                          <RadioGroupItem value="hours" id="hours" />
                          <Label htmlFor="hours" className="text-sm text-gray-700 cursor-pointer">A few hours only (transit)</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                          <RadioGroupItem value="overnight" id="overnight" />
                          <Label htmlFor="overnight" className="text-sm text-gray-700 cursor-pointer">One night or more</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Arrival Information */}
        {formData.currentStep === 3 && (
          <div className="py-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-hawaii-blue" />
                  Arrival Information
                </h2>
                <p className="text-sm text-gray-600 mb-6">Please provide details about your arrival to Hawaii.</p>
                
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-3">
                      Method of arrival <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup 
                      value={formData.arrivalMethod} 
                      onValueChange={(value) => {
                        updateFormData({ arrivalMethod: value as any });
                        // Clear departure location when switching to flight since it's not needed
                        if (value === 'flight') {
                          updateFormData({ departureLocation: '' });
                        }
                      }}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="flight" id="flight" />
                        <Label htmlFor="flight" className="text-sm text-gray-700 cursor-pointer">✈️ Commercial Flight</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="ship" id="ship" />
                        <Label htmlFor="ship" className="text-sm text-gray-700 cursor-pointer">🚢 Cruise Ship</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="text-sm text-gray-700 cursor-pointer">🛥️ Private Vessel / Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Only show departure location for ships and other vessel types, not for flights */}
                  {(formData.arrivalMethod === 'ship' || formData.arrivalMethod === 'other') && (
                    <div>
                      <Label htmlFor="departureLocation" className="block text-sm font-medium text-gray-700 mb-2">
                        Departure location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="departureLocation"
                        value={formData.departureLocation}
                        onChange={(e) => updateFormData({ departureLocation: e.target.value })}
                        placeholder="e.g., Los Angeles, CA"
                        className="w-full"
                      />
                    </div>
                  )}

                  {formData.arrivalMethod === 'flight' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="airline" className="block text-sm font-medium text-gray-700 mb-2">
                            Airline <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            value={formData.airline} 
                            onValueChange={(value) => updateFormData({ airline: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select airline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Alaska Airlines">Alaska Airlines</SelectItem>
                              <SelectItem value="American Airlines">American Airlines</SelectItem>
                              <SelectItem value="Delta Airlines">Delta Airlines</SelectItem>
                              <SelectItem value="Hawaiian Airlines">Hawaiian Airlines</SelectItem>
                              <SelectItem value="Southwest Airlines">Southwest Airlines</SelectItem>
                              <SelectItem value="United Airlines">United Airlines</SelectItem>
                              <SelectItem value="Other Airline">Other Airline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Flight number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="flightNumber"
                            value={formData.flightNumber}
                            onChange={(e) => updateFormData({ flightNumber: e.target.value })}
                            placeholder="e.g., HA123"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.arrivalMethod === 'ship' && (
                    <>
                      <div>
                        <Label htmlFor="shipName" className="block text-sm font-medium text-gray-700 mb-2">
                          Ship/Vessel name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="shipName"
                          value={formData.shipName}
                          onChange={(e) => updateFormData({ shipName: e.target.value })}
                          placeholder="e.g., Pride of America"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingLine" className="block text-sm font-medium text-gray-700 mb-2">
                          Cruise line / Shipping company
                        </Label>
                        <Input
                          id="shippingLine"
                          value={formData.shippingLine}
                          onChange={(e) => updateFormData({ shippingLine: e.target.value })}
                          placeholder="e.g., Norwegian Cruise Line"
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Arrival date
                      </Label>
                      <Input
                        id="arrivalDate"
                        type="date"
                        value={formData.arrivalDate}
                        onChange={(e) => updateFormData({ arrivalDate: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="arrivalPort" className="block text-sm font-medium text-gray-700 mb-2">
                        Arrival port/airport
                      </Label>
                      <Select 
                        value={formData.arrivalPort} 
                        onValueChange={(value) => updateFormData({ arrivalPort: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select port" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hnl">HNL - Honolulu International</SelectItem>
                          <SelectItem value="ogg">OGG - Maui (Kahului)</SelectItem>
                          <SelectItem value="koa">KOA - Kona International</SelectItem>
                          <SelectItem value="ito">ITO - Hilo International</SelectItem>
                          <SelectItem value="lih">LIH - Lihue Airport</SelectItem>
                          <SelectItem value="mkk">MKK - Molokai Airport</SelectItem>
                          <SelectItem value="lny">LNY - Lanai Airport</SelectItem>
                          <SelectItem value="hnm">HNM - Hana Airport</SelectItem>
                          <SelectItem value="honolulu-harbor">Honolulu Harbor</SelectItem>
                          <SelectItem value="lahaina-harbor">Lahaina Harbor</SelectItem>
                          <SelectItem value="kailua-kona-harbor">Kailua-Kona Harbor</SelectItem>
                          <SelectItem value="nawiliwili-harbor">Nawiliwili Harbor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Island Destinations */}
        {formData.currentStep === 4 && (
          <div className="py-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-hawaii-blue" />
                  Island Destinations
                </h2>
                <p className="text-sm text-gray-600 mb-6">Select the islands you plan to visit and number of nights at each location.</p>
                
                <div className="space-y-4">
                  {hawaiianIslands.map(island => (
                    <div key={island.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Checkbox
                            id={island.id}
                            checked={formData.islands.includes(island.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFormData({ islands: [...formData.islands, island.id] });
                              } else {
                                updateFormData({ islands: formData.islands.filter(id => id !== island.id) });
                              }
                            }}
                          />
                          <Label htmlFor={island.id} className="ml-3 font-medium text-gray-900 cursor-pointer">
                            {island.name}
                          </Label>
                        </div>
                        <img 
                          src={island.image} 
                          alt={island.name}
                          className="w-12 h-8 object-cover rounded"
                        />
                      </div>
                      {formData.islands.includes(island.id) && (
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-600">Nights:</Label>
                          <Input
                            type="number"
                            min="0"
                            max="30"
                            value={formData.islandNights[island.id] || 0}
                            onChange={(e) => updateFormData({ 
                              islandNights: { 
                                ...formData.islandNights, 
                                [island.id]: parseInt(e.target.value) || 0 
                              }
                            })}
                            className="w-20"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Plant & Food Declaration */}
        {formData.currentStep === 5 && (
          <div className="py-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Leaf className="w-6 h-6 mr-2 text-hawaii-green" />
                  Plant & Food Items
                </h2>
                <p className="text-sm text-gray-600 mb-6">Select any plant or food items you are carrying. All marked items will be inspected.</p>
                
                {/* Notice when plant items are selected */}
                {formData.plantItems.length > 0 && !formData.plantItems.includes('none-of-above') && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Please specify items you are carrying at the bottom of the screen (you may need to scroll).
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {plantItems.map(item => (
                    <div key={item.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={item.id}
                        checked={formData.plantItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (item.id === 'none-of-above') {
                              // If "None of Above" is selected, clear all other selections
                              updateFormData({ plantItems: ['none-of-above'] });
                            } else {
                              // If other item is selected, remove "None of Above" if present
                              const filteredItems = formData.plantItems.filter(id => id !== 'none-of-above');
                              updateFormData({ plantItems: [...filteredItems, item.id] });
                            }
                          } else {
                            updateFormData({ plantItems: formData.plantItems.filter(id => id !== item.id) });
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={item.id} className="font-medium text-gray-900 cursor-pointer">{item.name}</Label>
                          <span className="text-xl">{item.icon}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {formData.plantItems.length > 0 && !formData.plantItems.includes('none-of-above') && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-hawaii-light border border-hawaii-blue/20 rounded-lg p-4">
                      <h4 className="font-medium text-hawaii-blue mb-3">Specify Items</h4>
                      <Textarea
                        placeholder="List the specific types/names of the items you marked above..."
                        value={formData.plantItemsDescription}
                        onChange={(e) => updateFormData({ plantItemsDescription: e.target.value })}
                        className="resize-none"
                        rows={4}
                      />
                      <p className="text-xs text-gray-600 mt-2">Items meeting state requirements will be inspected and released.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 6: Animal Declaration */}
        {formData.currentStep === 6 && (
          <div className="py-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Fish className="w-6 h-6 mr-2 text-teal-600" />
                  Animal Declaration
                </h2>
                <p className="text-sm text-gray-600 mb-6">Select any live animals you are traveling with.</p>
                
                {formData.animalItems.length > 0 && !formData.animalItems.includes('none-of-above') && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Please specify items you are carrying at the bottom of the screen (you may need to scroll).
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {animalItems.map(item => (
                    <div key={item.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={item.id}
                        checked={formData.animalItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (item.id === 'none-of-above') {
                              // If "None of Above" is selected, clear all other selections
                              updateFormData({ animalItems: ['none-of-above'] });
                            } else {
                              // If other item is selected, remove "None of Above" if present
                              const filteredItems = formData.animalItems.filter(id => id !== 'none-of-above');
                              updateFormData({ animalItems: [...filteredItems, item.id] });
                            }
                          } else {
                            updateFormData({ animalItems: formData.animalItems.filter(id => id !== item.id) });
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={item.id} className="font-medium text-gray-900 cursor-pointer">{item.name}</Label>
                          <span className="text-xl">{item.icon}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {formData.animalItems.length > 0 && !formData.animalItems.includes('none-of-above') && (
                  <div className="mt-6 space-y-4">
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-yellow-900">Important Animal Transport Notice</h4>
                            <p className="text-sm text-yellow-800 mt-1">You MUST notify a cabin attendant BEFORE deplaning. All live animals must be turned in to the Honolulu Airport Animal Quarantine Holding Facility by the transportation carrier.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="bg-hawaii-light border border-hawaii-blue/20 rounded-lg p-4">
                      <h4 className="font-medium text-hawaii-blue mb-3">Specify Animals</h4>
                      <Textarea
                        placeholder="List the specific types/names of animals you are traveling with..."
                        value={formData.animalItemsDescription}
                        onChange={(e) => updateFormData({ animalItemsDescription: e.target.value })}
                        className="resize-none"
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 7: Contact Information */}
        {formData.currentStep === 7 && (
          <div className="py-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-hawaii-blue" />
                  Contact Information
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Please provide your contact information. This will be saved securely and auto-filled for future declarations.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName || ''}
                      onChange={(e) => updateFormData({ fullName: e.target.value })}
                      className="mt-1"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="homeAddress" className="text-sm font-medium text-gray-700">
                      Home Address *
                    </Label>
                    <Textarea
                      id="homeAddress"
                      value={formData.homeAddress || ''}
                      onChange={(e) => updateFormData({ homeAddress: e.target.value })}
                      className="mt-1"
                      placeholder="Enter your complete home address"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                      className="mt-1"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Privacy Notice</p>
                      <p>Your contact information is stored securely and will automatically fill future forms for your convenience. This information is only used for official agriculture declaration purposes.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 8: Hawaii Address */}
        {formData.currentStep === 8 && (
          <div className="py-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-hawaii-blue" />
                  Hawaii Address or Accommodation
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Please provide your address or accommodation name while in Hawaii.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                    <Checkbox
                      id="sameAsHomeAddress"
                      checked={formData.sameAsHomeAddress}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        updateFormData({ sameAsHomeAddress: isChecked });
                        if (isChecked) {
                          updateFormData({ hawaiiAddress: '' });
                        }
                      }}
                    />
                    <Label htmlFor="sameAsHomeAddress" className="text-sm text-gray-700 cursor-pointer">
                      Same as home address
                    </Label>
                  </div>

                  {!formData.sameAsHomeAddress && (
                    <div>
                      <Label htmlFor="hawaiiAddress" className="text-sm font-medium text-gray-700">
                        Hawaii Address or Accommodation Name *
                      </Label>
                      <Textarea
                        id="hawaiiAddress"
                        value={formData.hawaiiAddress || ''}
                        onChange={(e) => updateFormData({ hawaiiAddress: e.target.value })}
                        className="mt-1"
                        placeholder="Enter your Hawaii address, hotel name, or accommodation details"
                        rows={3}
                        required={!formData.sameAsHomeAddress}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Include hotel name, Airbnb address, or friend/family address where you'll be staying
                      </p>
                    </div>
                  )}

                  {formData.sameAsHomeAddress && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800">
                          Using your home address as your Hawaii address
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 9: Review & Submit */}
        {formData.currentStep === 9 && (
          <div className="py-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h2>
                <p className="text-sm text-gray-600 mb-6">Please review your declaration before submitting.</p>
                
                {/* Summary Cards */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Traveler Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Full name: <span className="font-medium">{formData.fullName}</span></p>
                      <p>Number of travelers: <span className="font-medium">{formData.numberOfPeople}</span></p>
                      <p>Traveler type: <span className="font-medium">{formData.travelerType}</span></p>
                      {(formData.travelerType === 'visitor' || formData.travelerType === 'moving') && (
                        <p>Visit frequency: <span className="font-medium">{formData.visitFrequency}</span></p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Hawaii Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>
                        {formData.sameAsHomeAddress 
                          ? 'Same as home address' 
                          : formData.hawaiiAddress || 'Not provided'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Island Destinations</h4>
                    <div className="text-sm text-gray-600">
                      {formData.islands.length > 0 ? (
                        <div className="space-y-1">
                          {formData.islands.map(islandId => {
                            const island = hawaiianIslands.find(i => i.id === islandId);
                            const nights = formData.islandNights[islandId] || 0;
                            return (
                              <p key={islandId}>
                                {island?.name}: <span className="font-medium">{nights} nights</span>
                              </p>
                            );
                          })}
                        </div>
                      ) : (
                        <p>No islands selected</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items Declaration</h4>
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Plant/Food Items: <span className="font-medium">
                        {(() => {
                          const actualPlantItems = formData.plantItems.filter(item => item !== 'none-of-above');
                          if (actualPlantItems.length === 0) {
                            return 'None Declared';
                          }
                          return `${actualPlantItems.length} items declared`;
                        })()}
                      </span></p>
                      <p>Animal Items: <span className="font-medium">
                        {(() => {
                          const actualAnimalItems = formData.animalItems.filter(item => item !== 'none-of-above');
                          if (actualAnimalItems.length === 0) {
                            return 'None Declared';
                          }
                          return `${actualAnimalItems.length} items declared`;
                        })()}
                      </span></p>
                    </div>
                  </div>
                </div>
                
                {/* Final Certification */}
                <div className="mt-6 space-y-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start">
                        <Checkbox id="certification" className="mt-1" required />
                        <Label htmlFor="certification" className="ml-3 text-sm text-blue-900">
                          <strong>I certify</strong> that the information provided on this form is true and complete to the best of my knowledge. I understand that providing false information may result in penalties up to $25,000 and/or imprisonment.
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start">
                        <Checkbox id="inspection" className="mt-1" required />
                        <Label htmlFor="inspection" className="ml-3 text-sm text-green-900">
                          I understand that all declared items must be presented for inspection at the Agricultural Inspection Counter in the baggage claim area.
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-hawaii-blue" />
                  Questions or Issues?
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Hawaii Department of Agriculture</strong></p>
                  <p>Plant Quarantine Branch: <a href="tel:8088320566" className="text-hawaii-blue font-medium">(808) 832-0566</a></p>
                  <p>Website: <a href="https://hdoa.hawaii.gov" className="text-hawaii-blue font-medium">hdoa.hawaii.gov</a></p>
                  <p>Digital form: <a href="https://akamaiarrival.hawaii.gov" className="text-hawaii-blue font-medium">akamaiarrival.hawaii.gov</a></p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <FormNavigation
        currentStep={formData.currentStep}
        totalSteps={TOTAL_STEPS}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canProceed={canProceed()}
        isSubmitting={submitMutation.isPending}
      />

      <PWAInstallPrompt />
      
      {/* Offline indicator */}
      {!navigator.onLine && (
        <div className="offline-indicator">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          You are offline. Your progress is saved locally.
        </div>
      )}
    </div>
  );
}
