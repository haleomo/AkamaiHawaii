import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FormData {
  declarationId?: number;
  numberOfPeople: number;
  travelerType: 'visitor' | 'resident' | 'moving' | '';
  visitFrequency: '1st' | '2nd' | '3rd' | '4th' | '5th' | '6-10' | '10+' | '';
  duration: 'hours' | 'overnight' | '';
  islands: string[];
  islandNights: Record<string, number>;
  plantItems: string[];
  animalItems: string[];
  plantItemsDescription: string;
  animalItemsDescription: string;
  language: string;
  currentStep: number;
  isSubmitted: boolean;
}

interface FormStore {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
  getStepData: (step: number) => any;
}

const initialFormData: FormData = {
  numberOfPeople: 1,
  travelerType: '',
  visitFrequency: '',
  duration: '',
  islands: [],
  islandNights: {},
  plantItems: [],
  animalItems: [],
  plantItemsDescription: '',
  animalItemsDescription: '',
  language: 'en',
  currentStep: 1,
  isSubmitted: false,
};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      
      updateFormData: (data) => 
        set((state) => ({
          formData: { ...state.formData, ...data }
        })),
      
      setCurrentStep: (step) =>
        set((state) => ({
          formData: { ...state.formData, currentStep: step }
        })),
      
      resetForm: () => 
        set({ formData: initialFormData }),
      
      getStepData: (step: number) => {
        const { formData } = get();
        switch (step) {
          case 2:
            return {
              numberOfPeople: formData.numberOfPeople,
              travelerType: formData.travelerType,
              visitFrequency: formData.visitFrequency,
              duration: formData.duration,
            };
          case 3:
            return {
              islands: formData.islands,
              islandNights: formData.islandNights,
            };
          case 4:
            return {
              plantItems: formData.plantItems,
              plantItemsDescription: formData.plantItemsDescription,
            };
          case 5:
            return {
              animalItems: formData.animalItems,
              animalItemsDescription: formData.animalItemsDescription,
            };
          default:
            return formData;
        }
      },
    }),
    {
      name: 'hawaii-declaration-form',
      partialize: (state) => ({ formData: state.formData }),
    }
  )
);
