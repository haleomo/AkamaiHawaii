import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Trash2, Edit, Calendar, ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useFormStore } from "@/lib/form-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Declaration } from "@shared/schema";

export default function Drafts() {
  const [, setLocation] = useLocation();
  const { updateFormData, setCurrentStep } = useFormStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all drafts
  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ['/api/drafts'],
    queryFn: async () => {
      const response = await fetch('/api/drafts');
      if (!response.ok) throw new Error('Failed to fetch drafts');
      return response.json();
    }
  });

  // Delete draft mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/drafts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts'] });
      toast({
        title: "Draft deleted",
        description: "The draft has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the draft. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEditDraft = (draft: Declaration) => {
    // Load draft data into form store
    updateFormData({
      declarationId: draft.id,
      numberOfPeople: draft.numberOfPeople,
      travelerType: draft.travelerType as any,
      visitFrequency: draft.visitFrequency as any,
      duration: draft.duration as any,
      arrivalMethod: draft.arrivalMethod as any,
      flightNumber: draft.flightNumber || '',
      airline: draft.airline || '',
      shipName: draft.shipName || '',
      shippingLine: draft.shippingLine || '',
      arrivalDate: draft.arrivalDate ? new Date(draft.arrivalDate).toISOString().split('T')[0] : '',
      arrivalPort: draft.arrivalPort || '',
      departureLocation: draft.departureLocation || '',
      islands: (draft.islands as string[]) || [],
      islandNights: (draft.islandNights as Record<string, number>) || {},
      plantItems: (draft.plantItems as string[]) || [],
      animalItems: (draft.animalItems as string[]) || [],
      plantItemsDescription: draft.plantItemsDescription || '',
      animalItemsDescription: draft.animalItemsDescription || '',
      language: draft.language,
      currentStep: 1,
      isSubmitted: false,
    });
    
    setCurrentStep(1);
    setLocation('/form');
  };

  const handleDeleteDraft = (id: number) => {
    deleteMutation.mutate(id);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDraftProgress = (draft: Declaration) => {
    let progress = 0;
    let totalSteps = 7;
    
    // Step 1: Basic info (always completed if draft exists)
    progress += 1;
    
    // Step 2: Traveler info (always completed if draft exists)
    progress += 1;
    
    // Step 3: Arrival info
    if (draft.arrivalMethod && draft.departureLocation) {
      progress += 1;
    }
    
    // Step 4: Islands
    if ((draft.islands as string[])?.length > 0) {
      progress += 1;
    }
    
    // Step 5: Plant items
    if ((draft.plantItems as string[])?.length > 0) {
      progress += 1;
    }
    
    // Step 6: Animal items
    if ((draft.animalItems as string[])?.length > 0) {
      progress += 1;
    }
    
    // Step 7: Final submission (not completed for drafts)
    
    return Math.round((progress / totalSteps) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hawaii-blue mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Saved Drafts</h1>
              <p className="text-sm text-gray-600">Continue where you left off</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {drafts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">No saved drafts</h2>
            <p className="text-gray-600 mb-6">
              Start a new declaration to save your progress as a draft.
            </p>
            <Button onClick={() => setLocation('/')} className="bg-hawaii-blue hover:bg-hawaii-blue/90">
              Start New Declaration
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft: Declaration) => (
              <Card key={draft.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-hawaii-blue" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Declaration #{draft.id}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(draft.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDraft(draft)}
                        className="text-hawaii-blue hover:text-hawaii-blue/80"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{getDraftProgress(draft)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-hawaii-blue h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getDraftProgress(draft)}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Travelers:</span>
                        <span className="ml-1 font-medium">{draft.numberOfPeople}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-1 font-medium capitalize">{draft.travelerType}</span>
                      </div>
                      {draft.departureLocation && (
                        <div className="col-span-2">
                          <span className="text-gray-600">From:</span>
                          <span className="ml-1 font-medium">{draft.departureLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}