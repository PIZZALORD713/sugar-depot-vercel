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

interface Ora {
  name: string
  oraNumber: string
  image: string
  traits: Record<string, string>
  openseaUrl: string
}

// ENS resolution function
async function resolveENS(ensName: string): Promise<string | null> {
  try {
    console.log(`🔍 DEBUG: Resolving ENS name: ${ensName}`)

    // Use a public ENS resolver API
    const response = await fetch(`https://api.ensideas.com/ens/resolve/${ensName}`)

    if (response.ok) {
      const data = await response.json()
      if (data.address) {
        console.log(`✅ DEBUG: ENS resolved ${ensName} -> ${data.address}`)
        return data.address
      }
    }

    // Fallback to another ENS resolver
    const fallbackResponse = await fetch(`https://api.web3.bio/profile/${ensName}`)
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json()
      if (fallbackData.address) {
        console.log(`✅ DEBUG: ENS resolved via fallback ${ensName} -> ${fallbackData.address}`)
        return fallbackData.address
      }
    }

    console.log(`⚠️ DEBUG: Could not resolve ENS name: ${ensName}`)
    return null
  } catch (error) {
    console.log(`❌ DEBUG: ENS resolution error for ${ensName}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const walletInput = searchParams.get("wallet")

  if (!walletInput) {
    return NextResponse.json({ error: "Wallet address or ENS name is required" }, { status: 400 })
  }

  let wallet = walletInput.trim()
  let resolvedFromENS = false

  // Check if input is an ENS name (ends with .eth or contains non-hex characters)
  const isENS =
    wallet.endsWith(".eth") || wallet.endsWith(".xyz") || wallet.endsWith(".com") || !/^0x[a-fA-F0-9]{40}$/.test(wallet)

  if (isENS) {
    console.log(`🔍 DEBUG: Input appears to be ENS name: ${wallet}`)
    const resolvedAddress = await resolveENS(wallet)

    if (!resolvedAddress) {
      return NextResponse.json(
        {
          error: `Could not resolve ENS name "${wallet}". Please check the name or use a wallet address directly.`,
        },
        { status: 400 },
      )
    }

    wallet = resolvedAddress
    resolvedFromENS = true
    console.log(`✅ DEBUG: Using resolved address: ${wallet}`)
  }

  // Validate wallet address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 })
  }

  console.log(
    `🔍 DEBUG: Searching for Sugartown Oras in wallet: ${wallet}${resolvedFromENS ? ` (resolved from ${walletInput})` : ""}`,
  )

  try {
    // OpenSea v2 API has a maximum limit of 100 NFTs per request
    const collectionName = "sugartown-oras" // Correct collection name
    const openseaUrl = `https://api.opensea.io/api/v2/chain/ethereum/account/${wallet}/nfts?collection=${collectionName}&limit=100`

    const headers: Record<string, string> = {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (compatible; NFT-Dashboard/1.0)",
    }

    // Add API key if available
    if (process.env.OPENSEA_API_KEY) {
      headers["x-api-key"] = process.env.OPENSEA_API_KEY
    }

    console.log(`🔍 DEBUG: Fetching from OpenSea v2 API`)
    console.log(`🔍 DEBUG: URL: ${openseaUrl}`)

    const response = await fetch(openseaUrl, {
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    const responseText = await response.text()
    console.log(`🔍 DEBUG: Response status: ${response.status}`)

    if (!response.ok) {
      console.log(`❌ DEBUG: API request failed`)
      console.log(`🔍 DEBUG: Response body:`, responseText)

      if (response.status === 429) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
      }

      // Try alternative collection names if the primary one fails
      const alternativeCollections = ["sugartow-noras", "sugartown-ora", "sugartownoras", "oras-sugartown"]

      for (const altCollection of alternativeCollections) {
        try {
          console.log(`🔍 DEBUG: Trying alternative collection: ${altCollection}`)
          const altUrl = `https://api.opensea.io/api/v2/chain/ethereum/account/${wallet}/nfts?collection=${altCollection}&limit=100`

          const altResponse = await fetch(altUrl, {
            headers,
            next: { revalidate: 300 },
          })

          if (altResponse.ok) {
            const altData: OpenSeaV2Response = await altResponse.json()
            if (altData.nfts && altData.nfts.length > 0) {
              console.log(`✅ DEBUG: Found ${altData.nfts.length} NFTs with collection: ${altCollection}`)
              return await processNFTs(
                altData.nfts,
                resolvedFromENS ? walletInput : wallet,
                resolvedFromENS ? wallet : undefined,
              )
            }
          }
        } catch (altError) {
          console.log(`❌ DEBUG: Alternative collection ${altCollection} failed:`, altError)
          continue
        }
      }

      throw new Error(`OpenSea API error: ${response.status} - ${responseText}`)
    }

    const data: OpenSeaV2Response = JSON.parse(responseText)
    console.log(`🔍 DEBUG: Response parsed successfully`)
    console.log(`🔍 DEBUG: Found ${data.nfts?.length || 0} NFTs`)

    if (!data.nfts || data.nfts.length === 0) {
      console.log(`⚠️ DEBUG: No NFTs found in response`)
      return NextResponse.json({
        oras: [],
        ...(resolvedFromENS && {
          resolvedFrom: walletInput,
          resolvedAddress: wallet,
        }),
      })
    }

    return await processNFTs(data.nfts, resolvedFromENS ? walletInput : wallet, resolvedFromENS ? wallet : undefined)
  } catch (error) {
    console.error("❌ DEBUG: Fatal error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? `Failed to fetch Ora data: ${error.message}` : "Failed to fetch Ora data",
        details: "Please check the wallet address and try again. Check server logs for more information.",
      },
      { status: 500 },
    )
  }
}

async function processNFTs(
  nfts: OpenSeaV2NFT[],
  originalInput: string,
  resolvedWallet?: string,
): Promise<NextResponse> {
  console.log(`🔍 DEBUG: Processing ${nfts.length} NFTs for metadata`)

  // Process each NFT
  const metadataPromises = nfts.map(async (nft): Promise<Ora | null> => {
    try {
      console.log(`🔍 DEBUG: Processing NFT ${nft.identifier}: ${nft.name}`)

      let metadata: NFTMetadata

      // Try to fetch metadata from metadata_url if available
      if (nft.metadata_url) {
        try {
          console.log(`🔍 DEBUG: Fetching metadata from: ${nft.metadata_url}`)

          const metaResponse = await fetch(nft.metadata_url, {
            headers: {
              accept: "application/json",
              "user-agent": "Mozilla/5.0 (compatible; NFT-Dashboard/1.0)",
            },
            next: { revalidate: 3600 }, // Cache metadata for 1 hour
          })

          if (metaResponse.ok) {
            metadata = await metaResponse.json()
            console.log(`✅ DEBUG: Successfully fetched metadata for ${nft.identifier}`)
          } else {
            throw new Error(`Metadata fetch failed: ${metaResponse.status}`)
          }
        } catch (metaError) {
          console.log(`⚠️ DEBUG: Failed to fetch metadata for ${nft.identifier}, using OpenSea data`)
          // Fallback to OpenSea data
          metadata = {
            name: nft.name || `Sugartown Ora #${nft.identifier}`,
            image: nft.display_image_url || nft.image_url || "",
            attributes: [],
          }
        }
      } else {
        // Use OpenSea data directly
        metadata = {
          name: nft.name || `Sugartown Ora #${nft.identifier}`,
          image: nft.display_image_url || nft.image_url || "",
          attributes: [],
        }
      }

      // Process traits
      const traits: Record<string, string> = {}
      if (metadata.attributes) {
        metadata.attributes.forEach((attr) => {
          if (attr.trait_type && attr.value !== null && attr.value !== undefined) {
            traits[attr.trait_type] = String(attr.value)
          }
        })
      }

      // Extract Ora number from name or use token ID
      const oraNumberMatch = metadata.name?.match(/#(\d+)/)
      const oraNumber = oraNumberMatch ? oraNumberMatch[1] : nft.identifier

      const result: Ora = {
        name: metadata.name || `Sugartown Ora #${oraNumber}`,
        oraNumber,
        image:
          metadata.image || nft.display_image_url || nft.image_url || "/placeholder.svg?height=400&width=400&text=Ora",
        traits,
        openseaUrl: nft.opensea_url,
      }

      console.log(`✅ DEBUG: Successfully processed Ora #${oraNumber}: ${result.name}`)
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

  // Include ENS resolution info in response
  const isENS =
    originalInput.endsWith(".eth") ||
    originalInput.endsWith(".xyz") ||
    originalInput.endsWith(".com") ||
    !/^0x[a-fA-F0-9]{40}$/.test(originalInput)

  return NextResponse.json({
    oras: validOras,
    ...(isENS &&
      resolvedWallet && {
        resolvedFrom: originalInput,
        resolvedAddress: resolvedWallet,
      }),
  })
}
