import { type NextRequest, NextResponse } from "next/server"

interface OpenSeaV2NFT {
  identifier: string
  collection: string
  contract: string
  token_standard: string
  name: string
  description: string
  image_url: string
  display_image_url: string
  display_animation_url?: string
  metadata_url: string
  opensea_url: string
  updated_at: string
  is_disabled: boolean
  is_nsfw: boolean
}

interface OpenSeaV2Response {
  nfts: OpenSeaV2NFT[]
}

interface NFTMetadata {
  name: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

interface ChatGPTOra {
  name: string
  tokenId: string
  image: string
  traits: Record<string, string>
  openseaUrl: string
  rarityScore?: number
}

interface ChatGPTResponse {
  success: boolean
  data?: {
    wallet: string
    ensName?: string
    totalOras: number
    oras: ChatGPTOra[]
    collectionInfo: {
      name: string
      contractAddress: string
      blockchain: string
    }
  }
  error?: string
  message?: string
}

// ENS resolution function
async function resolveENS(ensName: string): Promise<string | null> {
  try {
    console.log(`🔍 ChatGPT API: Resolving ENS name: ${ensName}`)

    // Use a public ENS resolver API
    const response = await fetch(`https://api.ensideas.com/ens/resolve/${ensName}`)

    if (response.ok) {
      const data = await response.json()
      if (data.address) {
        console.log(`✅ ChatGPT API: ENS resolved ${ensName} -> ${data.address}`)
        return data.address
      }
    }

    // Fallback to another ENS resolver
    const fallbackResponse = await fetch(`https://api.web3.bio/profile/${ensName}`)
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json()
      if (fallbackData.address) {
        console.log(`✅ ChatGPT API: ENS resolved via fallback ${ensName} -> ${fallbackData.address}`)
        return fallbackData.address
      }
    }

    console.log(`⚠️ ChatGPT API: Could not resolve ENS name: ${ensName}`)
    return null
  } catch (error) {
    console.log(`❌ ChatGPT API: ENS resolution error for ${ensName}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")
  const format = searchParams.get("format") || "detailed" // detailed | summary
  const includeTraits = searchParams.get("includeTraits") !== "false"

  // CORS headers for ChatGPT
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  if (!address) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required parameter",
        message:
          "Please provide an 'address' parameter with either an ENS name (e.g., vitalik.eth) or EVM address (0x...)",
      } as ChatGPTResponse,
      { status: 400, headers: corsHeaders },
    )
  }

  let wallet = address.trim()
  let ensName: string | undefined

  // Check if input is an ENS name
  const isENS =
    wallet.endsWith(".eth") || wallet.endsWith(".xyz") || wallet.endsWith(".com") || !/^0x[a-fA-F0-9]{40}$/.test(wallet)

  if (isENS) {
    console.log(`🔍 ChatGPT API: Input appears to be ENS name: ${wallet}`)
    ensName = wallet
    const resolvedAddress = await resolveENS(wallet)

    if (!resolvedAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "ENS resolution failed",
          message: `Could not resolve ENS name "${wallet}". Please check the name or use a wallet address directly.`,
        } as ChatGPTResponse,
        { status: 400, headers: corsHeaders },
      )
    }

    wallet = resolvedAddress
    console.log(`✅ ChatGPT API: Using resolved address: ${wallet}`)
  }

  // Validate wallet address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid address format",
        message: "Please provide a valid EVM address (0x...) or ENS name (.eth, .xyz, .com)",
      } as ChatGPTResponse,
      { status: 400, headers: corsHeaders },
    )
  }

  console.log(`🔍 ChatGPT API: Fetching Sugartown Oras for wallet: ${wallet}${ensName ? ` (${ensName})` : ""}`)

  try {
    // OpenSea v2 API
    const collectionName = "sugartown-oras"
    const openseaUrl = `https://api.opensea.io/api/v2/chain/ethereum/account/${wallet}/nfts?collection=${collectionName}&limit=100`

    const headers: Record<string, string> = {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (compatible; ChatGPT-API/1.0)",
    }

    // Add API key if available
    if (process.env.OPENSEA_API_KEY) {
      headers["x-api-key"] = process.env.OPENSEA_API_KEY
    }

    const response = await fetch(openseaUrl, {
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.log(`❌ ChatGPT API: OpenSea request failed: ${response.status}`)

      // Try alternative collection names
      const alternativeCollections = ["sugartow-noras", "sugartown-ora", "sugartownoras"]

      for (const altCollection of alternativeCollections) {
        try {
          console.log(`🔍 ChatGPT API: Trying alternative collection: ${altCollection}`)
          const altUrl = `https://api.opensea.io/api/v2/chain/ethereum/account/${wallet}/nfts?collection=${altCollection}&limit=100`

          const altResponse = await fetch(altUrl, { headers, next: { revalidate: 300 } })

          if (altResponse.ok) {
            const altData: OpenSeaV2Response = await altResponse.json()
            if (altData.nfts && altData.nfts.length > 0) {
              console.log(`✅ ChatGPT API: Found ${altData.nfts.length} NFTs with collection: ${altCollection}`)
              return await processNFTsForChatGPT(altData.nfts, wallet, ensName, format, includeTraits, corsHeaders)
            }
          }
        } catch (altError) {
          console.log(`❌ ChatGPT API: Alternative collection ${altCollection} failed:`, altError)
          continue
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "OpenSea API error",
          message: `Failed to fetch NFTs from OpenSea. Status: ${response.status}`,
        } as ChatGPTResponse,
        { status: 500, headers: corsHeaders },
      )
    }

    const data: OpenSeaV2Response = await response.json()
    console.log(`🔍 ChatGPT API: Found ${data.nfts?.length || 0} NFTs`)

    if (!data.nfts || data.nfts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            wallet,
            ensName,
            totalOras: 0,
            oras: [],
            collectionInfo: {
              name: "Sugartown Oras",
              contractAddress: "0xd564c25b760cb278a55bdd98831f4ff4b6c97b38",
              blockchain: "Ethereum",
            },
          },
          message: `No Sugartown Oras found for ${ensName || wallet}`,
        } as ChatGPTResponse,
        { headers: corsHeaders },
      )
    }

    return await processNFTsForChatGPT(data.nfts, wallet, ensName, format, includeTraits, corsHeaders)
  } catch (error) {
    console.error("❌ ChatGPT API: Fatal error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      } as ChatGPTResponse,
      { status: 500, headers: corsHeaders },
    )
  }
}

async function processNFTsForChatGPT(
  nfts: OpenSeaV2NFT[],
  wallet: string,
  ensName: string | undefined,
  format: string,
  includeTraits: boolean,
  corsHeaders: Record<string, string>,
): Promise<NextResponse> {
  console.log(`🔍 ChatGPT API: Processing ${nfts.length} NFTs`)

  const processedOras: ChatGPTOra[] = []

  for (const nft of nfts) {
    try {
      let metadata: NFTMetadata

      // Try to fetch metadata
      if (nft.metadata_url) {
        try {
          const metaResponse = await fetch(nft.metadata_url, {
            headers: {
              accept: "application/json",
              "user-agent": "Mozilla/5.0 (compatible; ChatGPT-API/1.0)",
            },
            next: { revalidate: 3600 },
          })

          if (metaResponse.ok) {
            metadata = await metaResponse.json()
          } else {
            throw new Error(`Metadata fetch failed: ${metaResponse.status}`)
          }
        } catch (metaError) {
          // Fallback to OpenSea data
          metadata = {
            name: nft.name || `Sugartown Ora #${nft.identifier}`,
            image: nft.display_image_url || nft.image_url || "",
            attributes: [],
          }
        }
      } else {
        metadata = {
          name: nft.name || `Sugartown Ora #${nft.identifier}`,
          image: nft.display_image_url || nft.image_url || "",
          attributes: [],
        }
      }

      // Process traits
      const traits: Record<string, string> = {}
      if (includeTraits && metadata.attributes) {
        metadata.attributes.forEach((attr) => {
          if (attr.trait_type && attr.value !== null && attr.value !== undefined) {
            traits[attr.trait_type] = String(attr.value)
          }
        })
      }

      const ora: ChatGPTOra = {
        name: metadata.name || `Sugartown Ora #${nft.identifier}`,
        tokenId: nft.identifier,
        image: metadata.image || nft.display_image_url || nft.image_url || "",
        traits: includeTraits ? traits : {},
        openseaUrl: nft.opensea_url,
      }

      processedOras.push(ora)
    } catch (error) {
      console.warn(`⚠️ ChatGPT API: Error processing NFT ${nft.identifier}:`, error)
    }
  }

  // Sort by token ID
  processedOras.sort((a, b) => {
    const numA = Number.parseInt(a.tokenId) || 0
    const numB = Number.parseInt(b.tokenId) || 0
    return numA - numB
  })

  const response: ChatGPTResponse = {
    success: true,
    data: {
      wallet,
      ensName,
      totalOras: processedOras.length,
      oras: format === "summary" ? processedOras.slice(0, 10) : processedOras, // Limit to 10 for summary
      collectionInfo: {
        name: "Sugartown Oras",
        contractAddress: "0xd564c25b760cb278a55bdd98831f4ff4b6c97b38",
        blockchain: "Ethereum",
      },
    },
    message: `Successfully found ${processedOras.length} Sugartown Ora${processedOras.length !== 1 ? "s" : ""} for ${ensName || wallet}`,
  }

  console.log(`✅ ChatGPT API: Successfully processed ${processedOras.length} Oras`)

  return NextResponse.json(response, { headers: corsHeaders })
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
