export default function ProgressBar({
  steps,
  currentStep,
}: {
  steps: { id: string; title: string }[]
  currentStep: number
}) {
  const percent = Math.round(((currentStep + 1) / steps.length) * 100)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2 text-sm">
        <p className="font-medium text-white">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </p>
        <p className="text-gray-400">{percent}%</p>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="hidden sm:flex justify-between mt-2 gap-1">
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={`text-xs text-center flex-1 ${
              index === currentStep
                ? "text-orange-300 font-medium"
                : index < currentStep
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            {step.title}
          </span>
        ))}
      </div>
    </div>
  )
}
