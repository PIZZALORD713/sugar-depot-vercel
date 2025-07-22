import { type NextRequest, NextResponse } from "next/server"

interface NFTMetadata {
  name: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

interface Ora {
  name: string
  oraNumber: string
  image: string
  traits: Record<string, string>
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const wallet = searchParams.get("wallet")

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  // Validate wallet address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 })
  }

  // Sugartown Oras contract address from the OpenSea URL
  const SUGARTOWN_ORAS_CONTRACT = "0xd564c25b760cb278a55bdd98831f4ff4b6c97b38"

  console.log(`🔍 DEBUG: Searching for Sugartown Oras in wallet: ${wallet}`)
  console.log(`🔍 DEBUG: Using contract address: ${SUGARTOWN_ORAS_CONTRACT}`)

  try {
    let nfts: any[] = []

    // Try OpenSea v1 API with contract address filter
    try {
      const openseaUrl = `https://api.opensea.io/api/v1/assets?owner=${wallet}&asset_contract_address=${SUGARTOWN_ORAS_CONTRACT}&limit=200`

      const headers: Record<string, string> = {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (compatible; NFT-Dashboard/1.0)",
      }

      if (process.env.OPENSEA_API_KEY) {
        headers["X-API-KEY"] = process.env.OPENSEA_API_KEY
      }

      console.log(`🔍 DEBUG: Fetching from URL: ${openseaUrl}`)

      const response = await fetch(openseaUrl, {
        headers,
        next: { revalidate: 300 },
      })

      const responseText = await response.text()
      console.log(`🔍 DEBUG: Response status: ${response.status}`)
      console.log(`🔍 DEBUG: Response body (first 1000 chars):`, responseText.substring(0, 1000))

      if (response.ok) {
        const data = JSON.parse(responseText)
        if (data.assets && data.assets.length > 0) {
          console.log(`✅ DEBUG: Found ${data.assets.length} Sugartown Oras`)

          nfts = data.assets.map((asset: any) => ({
            identifier: asset.token_id,
            metadata_url: asset.token_metadata_uri,
            name: asset.name,
            image_url: asset.image_url,
            collection: asset.collection?.name,
            contract_address: asset.asset_contract?.address,
          }))
        } else {
          console.log(`⚠️ DEBUG: No assets found in response`)
        }
      } else {
        console.log(`❌ DEBUG: API request failed with status ${response.status}`)
        throw new Error(`OpenSea API error: ${response.status} - ${responseText}`)
      }
    } catch (error) {
      console.log(`❌ DEBUG: Error with contract-based search:`, error)

      // Fallback: Try without contract filter and then filter results
      try {
        console.log(`🔍 DEBUG: Trying fallback approach - fetch all NFTs and filter`)

        const openseaUrl = `https://api.opensea.io/api/v1/assets?owner=${wallet}&limit=200`

        const headers: Record<string, string> = {
          accept: "application/json",
          "user-agent": "Mozilla/5.0 (compatible; NFT-Dashboard/1.0)",
        }

        if (process.env.OPENSEA_API_KEY) {
          headers["X-API-KEY"] = process.env.OPENSEA_API_KEY
        }

        const response = await fetch(openseaUrl, { headers })

        if (response.ok) {
          const data = await response.json()
          if (data.assets) {
            console.log(`🔍 DEBUG: Total NFTs in wallet: ${data.assets.length}`)

            // Filter for Sugartown Oras contract
            const sugartownOras = data.assets.filter(
              (asset: any) => asset.asset_contract?.address?.toLowerCase() === SUGARTOWN_ORAS_CONTRACT.toLowerCase(),
            )

            console.log(`🔍 DEBUG: Sugartown Oras found after filtering: ${sugartownOras.length}`)

            if (sugartownOras.length > 0) {
              nfts = sugartownOras.map((asset: any) => ({
                identifier: asset.token_id,
                metadata_url: asset.token_metadata_uri,
                name: asset.name,
                image_url: asset.image_url,
                collection: asset.collection?.name,
                contract_address: asset.asset_contract?.address,
              }))
            }
          }
        }
      } catch (fallbackError) {
        console.log(`❌ DEBUG: Fallback approach also failed:`, fallbackError)
        throw error // Re-throw original error
      }
    }

    if (nfts.length === 0) {
      console.log(`⚠️ DEBUG: No Sugartown Oras found`)
      return NextResponse.json([])
    }

    console.log(`🔍 DEBUG: Processing ${nfts.length} NFTs for metadata`)

    // Fetch metadata for each NFT
    const metadataPromises = nfts.map(async (nft): Promise<Ora | null> => {
      try {
        let metadata: NFTMetadata

        // If we have metadata_url, fetch it; otherwise use OpenSea data
        if (nft.metadata_url) {
          console.log(`🔍 DEBUG: Fetching metadata from: ${nft.metadata_url}`)

          const metaResponse = await fetch(nft.metadata_url, {
            headers: {
              accept: "application/json",
              "user-agent": "Mozilla/5.0 (compatible; NFT-Dashboard/1.0)",
            },
            next: { revalidate: 3600 },
          })

          if (metaResponse.ok) {
            metadata = await metaResponse.json()
          } else {
            console.log(`⚠️ DEBUG: Failed to fetch metadata for token ${nft.identifier}, using OpenSea data`)
            // Fallback to OpenSea data
            metadata = {
              name: nft.name || `Sugartown Ora #${nft.identifier}`,
              image: nft.image_url || "",
              attributes: [],
            }
          }
        } else {
          // Use OpenSea data directly
          metadata = {
            name: nft.name || `Sugartown Ora #${nft.identifier}`,
            image: nft.image_url || "",
            attributes: [],
          }
        }

        // Process traits
        const traits: Record<string, string> = {}
        if (metadata.attributes) {
          metadata.attributes.forEach((attr) => {
            if (attr.trait_type && attr.value) {
              traits[attr.trait_type] = String(attr.value)
            }
          })
        }

        // Extract Ora number from name or use token ID
        const oraNumberMatch = metadata.name?.match(/#(\d+)/)
        const oraNumber = oraNumberMatch ? oraNumberMatch[1] : nft.identifier

        const result = {
          name: metadata.name || `Sugartown Ora #${oraNumber}`,
          oraNumber,
          image: metadata.image || nft.image_url || "/placeholder.svg?height=400&width=400&text=Ora",
          traits,
        }

        console.log(`✅ DEBUG: Processed Ora #${oraNumber}:`, result.name)
        return result
      } catch (error) {
        console.warn(`⚠️ DEBUG: Error processing NFT ${nft.identifier}:`, error)
        return null
      }
    })

    const results = await Promise.all(metadataPromises)
    const validOras = results.filter((ora): ora is Ora => ora !== null)

    // Sort by Ora number
    validOras.sort((a, b) => {
      const numA = Number.parseInt(a.oraNumber) || 0
      const numB = Number.parseInt(b.oraNumber) || 0
      return numA - numB
    })

    console.log(`✅ DEBUG: Successfully processed ${validOras.length} Sugartown Oras`)

    return NextResponse.json(validOras)
  } catch (error) {
    console.error("❌ DEBUG: Fatal error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? `Failed to fetch Ora data: ${error.message}` : "Failed to fetch Ora data",
        details: "Check server logs for more information",
      },
      { status: 500 },
    )
  }
}
