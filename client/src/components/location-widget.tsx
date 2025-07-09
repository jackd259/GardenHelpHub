import { MapPin, Sun } from "lucide-react";

export default function LocationWidget() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapPin className="text-garden-green w-5 h-5" />
          <div>
            <p className="font-semibold text-gray-900">Sacramento, CA</p>
            <p className="text-sm text-gray-600">Zone 9b • Currently 89°F</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Sun className="text-garden-amber w-5 h-5" />
          <span className="text-sm text-gray-600">Drought Alert</span>
        </div>
      </div>
    </div>
  );
}
