import type React from "react"
import { Badge } from "antd"
import type { OraCollectible } from "@/types/ora-collectible"
import type { CmpData } from "@/types/cmp-data"

interface OraCardCollectibleProps {
  ora: OraCollectible
  cmpData: CmpData
}

const OraCardCollectible: React.FC<OraCardCollectibleProps> = ({ ora, cmpData }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 truncate">{cmpData.customName || `Ora #${ora.oraNumber}`}</h3>
          <div className="flex items-center gap-1">{/* Favorite button and other controls */}</div>
        </div>
        {cmpData.customName && (
          <Badge variant="secondary" className="text-xs ml-2">
            Custom
          </Badge>
        )}
        {/* Additional details about the collectible */}
      </div>
    </div>
  )
}

export default OraCardCollectible
