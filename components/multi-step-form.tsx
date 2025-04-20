"use client"

import type { ReactNode } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { getTranslations } from "@/utils/translations"

interface Step {
  id: string
  title: string
  description?: string
}

interface MultiStepFormProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  children: ReactNode
  language: "en" | "ar"
  isSubmitting: boolean
  isLastStepPreview?: boolean
  onSubmit?: () => void
}

export default function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  children,
  language,
  isSubmitting,
  isLastStepPreview = false,
  onSubmit,
}: MultiStepFormProps) {
  const t = getTranslations(language)
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <nav aria-label="Progress" className="mb-8">
        <ol role="list" className={`flex items-center ${language === "ar" ? "flex-row-reverse" : ""}`}>
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`relative ${
                index !== steps.length - 1 ? `flex-1 ${language === "ar" ? "ml-6" : "mr-6"}` : ""
              }`}
            >
              {index < currentStep ? (
                // Completed step
                <div className="group">
                  <span className="flex items-center">
                    <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-green-600 group-hover:bg-green-800">
                      <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                    <span className={`${language === "ar" ? "mr-4" : "ml-4"} text-sm font-medium text-gray-900`}>
                      {step.title}
                    </span>
                  </span>
                  {index !== steps.length - 1 && (
                    <span
                      className={`absolute top-4 ${
                        language === "ar" ? "right-8 -ml-px" : "left-8 -mr-px"
                      } h-0.5 w-full bg-green-600`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              ) : index === currentStep ? (
                // Current step
                <div className="group" aria-current="step">
                  <span className="flex items-center">
                    <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                      <span className="text-blue-600 font-medium">{index + 1}</span>
                    </span>
                    <span className={`${language === "ar" ? "mr-4" : "ml-4"} text-sm font-medium text-blue-600`}>
                      {step.title}
                    </span>
                  </span>
                  {index !== steps.length - 1 && (
                    <span
                      className={`absolute top-4 ${
                        language === "ar" ? "right-8 -ml-px" : "left-8 -mr-px"
                      } h-0.5 w-full bg-gray-300`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              ) : (
                // Upcoming step
                <div className="group">
                  <span className="flex items-center">
                    <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                      <Circle className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                    <span className={`${language === "ar" ? "mr-4" : "ml-4"} text-sm font-medium text-gray-500`}>
                      {step.title}
                    </span>
                  </span>
                  {index !== steps.length - 1 && (
                    <span
                      className={`absolute top-4 ${
                        language === "ar" ? "right-8 -ml-px" : "left-8 -mr-px"
                      } h-0.5 w-full bg-gray-300`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
          {steps[currentStep].description && <p className="text-gray-500 mt-1">{steps[currentStep].description}</p>}
        </div>

        <div className="mb-8">{children}</div>

        {/* Navigation Buttons */}
        <div className={`flex ${language === "ar" ? "flex-row-reverse justify-start" : "justify-end"} gap-3 pt-4`}>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            >
              {t.back}
            </button>
          )}

          {!isLastStep && (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t.next}
            </button>
          )}

          {isLastStep && onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t.submitting : isLastStepPreview ? t.submitContract : t.previewContract}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
