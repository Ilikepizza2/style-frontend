"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";

// Map frontend body type values to backend values
const BODY_TYPE_MAP: Record<string, string> = {
	"apple": "Apple",
	"pear": "Pear",
	"hourglass": "Hourglass",
	"rectangle": "Rectangle",
	"inverted": "Inverted Triangle",
};

const OCCASION_COLORS: Record<string, string> = {
	casual: "bg-blue-500",
	formal: "bg-purple-500",
	funky: "bg-pink-500",
	romantic: "bg-rose-500",
	simple: "bg-neutral-500",
};

interface PriceInfo {
	mrp: number;
	selling_price: number;
	currency: string;
	discount_percent: number;
}

interface OutfitItem {
	image_id: string;
	category: string;
	subcategory: string;
	link: string;
	image_url: string;
	price: PriceInfo;
	reason: string;
}

interface TotalCost {
	amount: number;
	currency: string;
	savings: number;
}

interface GeneratedOutfit {
	outfit_name: string;
	occasion: string;
	outfit_description: string;
	items: OutfitItem[];
	styling_tips: string;
	explanation: string;
	total_cost?: TotalCost;
	rank?: number;
	ai_ranking_reason?: string;
}

interface OccasionOutfits {
	occasion: string;
	outfits: GeneratedOutfit[];  // All 3 ranked outfits
	current_index: number;  // Which one to show (0-2)
}

interface RankingData {
	body_type: string;
	description: string;
	goal: string;
}

function SuggestionsContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const rawBodyType = searchParams.get("bodyType") || "apple";
	const bodyType = BODY_TYPE_MAP[rawBodyType.toLowerCase()] || "Apple";
	
	const [bodyTypeInfo, setBodyTypeInfo] = useState<RankingData | null>(null);
	const [occasions, setOccasions] = useState<OccasionOutfits[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedOccasionIndex, setSelectedOccasionIndex] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const itemsPerPage = 5; // Show all 5 occasions

	// Fetch body type info and generate outfits on mount
	useEffect(() => {
		const fetchDataAndGenerateOutfits = async () => {
			try {
				setLoading(true);
				
				// Fetch body type info
				const bodyTypeResponse = await fetch("http://localhost:8000/api/rank", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ body_type: bodyType, top_n: 1 }),
				});

				if (bodyTypeResponse.ok) {
					const result = await bodyTypeResponse.json();
					setBodyTypeInfo({
						body_type: result.body_type,
						description: result.description,
						goal: result.goal,
					});
				}

				// Read all form data from sessionStorage
				const styleQuizDataStr = sessionStorage.getItem('styleQuizData');
				const referenceImageBase64 = sessionStorage.getItem('referenceImageBase64');
				
				let formData = {
					body_type: bodyType,
					colors: "",
					preferences: "",
					budget: "medium",
					gender: "female",
					age_group: "",
					occupation: "",
					height: "",
					preferred_fit: "",
					reference_image_base64: null as string | null,
					reference_item_description: "",
				};

				if (styleQuizDataStr) {
					try {
						const parsedData = JSON.parse(styleQuizDataStr);
						formData = {
							...formData,
							...parsedData,
							// Ensure body_type is in title case for API
							body_type: BODY_TYPE_MAP[parsedData.body_type?.toLowerCase()] || bodyType,
							reference_image_base64: referenceImageBase64,
						};
					} catch (e) {
						console.error("Error parsing style quiz data:", e);
					}
				}

				// Generate outfits with all form data
				const outfitsResponse = await fetch("http://localhost:8000/api/generate-outfits", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				});

				if (!outfitsResponse.ok) {
					const errorData = await outfitsResponse.json();
					throw new Error(errorData.detail || "Failed to generate outfits");
				}

				const outfitsData = await outfitsResponse.json();
				setOccasions(outfitsData.occasions || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		};

		fetchDataAndGenerateOutfits();
	}, [bodyType]);

	const regenerateOutfits = async () => {
		try {
			setLoading(true);
			setError(null);
			setSelectedOccasionIndex(null);

			// Read all form data from sessionStorage
			const styleQuizDataStr = sessionStorage.getItem('styleQuizData');
			const referenceImageBase64 = sessionStorage.getItem('referenceImageBase64');
			
			let formData = {
				body_type: bodyType,
				colors: "",
				preferences: "",
				budget: "medium",
				gender: "female",
				age_group: "",
				occupation: "",
				height: "",
				preferred_fit: "",
				reference_image_base64: null as string | null,
				reference_item_description: "",
			};

			if (styleQuizDataStr) {
				try {
					const parsedData = JSON.parse(styleQuizDataStr);
					formData = {
						...formData,
						...parsedData,
						// Ensure body_type is in title case for API
						body_type: BODY_TYPE_MAP[parsedData.body_type?.toLowerCase()] || bodyType,
						reference_image_base64: referenceImageBase64,
					};
				} catch (e) {
					console.error("Error parsing style quiz data:", e);
				}
			}

			const response = await fetch("http://localhost:8000/api/generate-outfits", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.detail || "Failed to generate outfits");
			}

			const data = await response.json();
			setOccasions(data.occasions || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const cycleOutfit = (occasionIndex: number) => {
		setOccasions(prev => prev.map((occ, idx) => {
			if (idx === occasionIndex) {
				const next_index = (occ.current_index + 1) % occ.outfits.length;
				return { ...occ, current_index: next_index };
			}
			return occ;
		}));
	};

	const displayedOccasions = occasions.filter(occ => occ.outfits.length > 0);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
				<div className="text-center">
					<div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
					<p className="text-lg font-medium text-purple-900">Curating your perfect outfits...</p>
					<p className="text-sm text-purple-600 mt-2">Our AI is analyzing the catalog just for you</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
				<Card className="max-w-md">
					<CardHeader>
						<CardTitle className="text-red-600">Error</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">{error}</p>
						{error.includes("API key") && (
							<p className="text-xs text-red-500 mb-4">
								Please set your GEMINI_API_KEY in the .env file to use AI features.
							</p>
						)}
						<div className="flex gap-2">
							<Button onClick={regenerateOutfits} variant="default">
								Try Again
							</Button>
							<Button asChild variant="outline">
								<Link href="/style-quiz">Back to Quiz</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Detail view for selected outfit
	if (selectedOccasionIndex !== null) {
		const occasionData = occasions[selectedOccasionIndex];
		const outfit = occasionData.outfits[occasionData.current_index];
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-12">
				{/* Header */}
				<div className="bg-white border-b sticky top-0 z-10 shadow-sm">
					<div className="mx-auto max-w-7xl px-6 py-4">
						<div className="flex items-center justify-between">
							<Button
								variant="ghost"
								onClick={() => setSelectedOccasionIndex(null)}
								className="flex items-center gap-2"
							>
								← Back to Outfits
							</Button>
							<div className="flex gap-2">
								<Button 
									onClick={() => cycleOutfit(selectedOccasionIndex)}
									variant="outline"
									className="flex items-center gap-2"
								>
									<RefreshCw className="w-4 h-4" />
									Next Outfit ({occasionData.current_index + 1}/{occasionData.outfits.length})
								</Button>
								<Button asChild variant="outline">
									<Link href="/style-quiz">New Quiz</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="mx-auto max-w-7xl px-6 py-8">
					{/* Outfit Header */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold mb-2">{outfit.outfit_name}</h1>
						<Badge variant="secondary" className="text-lg px-4 py-1 mb-2">
							{occasionData.occasion.toUpperCase()}
						</Badge>
						<p className="text-lg text-muted-foreground mt-2">{outfit.outfit_description}</p>
						{outfit.rank && outfit.rank === 1 && (
							<p className="text-sm text-green-600 mt-2">⭐ AI Top Pick</p>
						)}
						{outfit.ai_ranking_reason && (
							<p className="text-xs text-muted-foreground mt-1 italic">{outfit.ai_ranking_reason}</p>
						)}
					</div>

					{/* Buy Your Fit Section */}
					<Card className="mb-8">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-2xl mb-2">Buy your Fit</CardTitle>
									{outfit.total_cost && (
										<p className="text-lg font-semibold">
											Under ₹{outfit.total_cost.amount}
										</p>
									)}
								</div>
								<Button size="lg" className="px-8">
									Buy this bundle
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{outfit.items.map((item, idx) => (
									<Card key={idx} className="overflow-hidden group">
										{/* Product Image */}
										<div className="relative aspect-[3/4] bg-neutral-100">
											<img
												src={`http://localhost:8000${item.image_url}`}
												alt={item.subcategory}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
												onError={(e) => {
													e.currentTarget.src = `https://via.placeholder.com/400x533/f5f5f5/666666?text=${encodeURIComponent(item.subcategory)}`;
												}}
											/>
											<div className="absolute top-2 right-2 flex gap-1">
												<button className="p-2 bg-white/90 rounded-full hover:bg-white">
													<ThumbsUp className="w-4 h-4" />
												</button>
												<button className="p-2 bg-white/90 rounded-full hover:bg-white">
													<ThumbsDown className="w-4 h-4" />
												</button>
											</div>
										</div>
										
										<CardHeader className="pb-2">
											<CardTitle className="text-sm">
												{item.subcategory}
											</CardTitle>
											<p className="text-xs text-muted-foreground line-clamp-2">
												{item.reason}
											</p>
											<p className="text-sm font-bold mt-2">
												Budget: ₹{item.price.selling_price}
											</p>
										</CardHeader>
										
										<CardContent className="pt-0">
											<Button asChild size="sm" className="w-full">
												<a href={item.link} target="_blank" rel="noopener noreferrer">
													Shop Now →
												</a>
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Styling Tips */}
					<div className="grid md:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span>💡</span>
									Styling Tips
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm">{outfit.styling_tips}</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span>ℹ️</span>
									Why This Works
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm">{outfit.explanation}</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	// Grid view - main outfits display
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-12">
			{/* Header */}
			<div className="bg-white border-b">
				<div className="mx-auto max-w-7xl px-6 py-6">
					<nav className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Link href="/" className="hover:text-foreground">Homepage</Link>
							<span>/</span>
							<Link href="/style-quiz" className="hover:text-foreground">Style Quiz</Link>
							<span>/</span>
							<span className="text-foreground font-medium">Recommendations</span>
						</div>
						<Button asChild variant="outline">
							<Link href="/style-quiz">New Quiz</Link>
						</Button>
					</nav>
					
					<div className="text-center">
						<h1 className="text-3xl font-bold mb-2">
							Welcome, {bodyTypeInfo?.body_type ? `${bodyTypeInfo.body_type}!` : 'Aditi!'}
						</h1>
						<p className="text-muted-foreground">
							Based on your profile, here are outfits for your workday.
						</p>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-6 py-12">
				{/* Outfits Header */}
				<Card className="mb-8">
					<CardContent className="py-6">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-bold">
								We generated {displayedOccasions.length} occasions with ranked outfits for you
							</h2>
							<div className="flex items-center gap-4">
								<Button
									variant="outline"
									onClick={regenerateOutfits}
									className="flex items-center gap-2"
								>
									<RefreshCw className="w-4 h-4" />
									Regenerate All
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Outfits Grid */}
				<div>
					<h3 className="text-xl font-semibold mb-6 text-center">
						AI-Ranked Outfits for Every Occasion
					</h3>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<AnimatePresence mode="popLayout">
							{displayedOccasions.map((occasionData, index) => {
								const outfit = occasionData.outfits[occasionData.current_index];
								return (
									<motion.div
									key={occasionData.occasion}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="overflow-hidden hover:shadow-lg transition-shadow group">
										{/* Combined Items Preview */}
										<div className="relative aspect-[4/5] bg-neutral-100">
											<div className="absolute top-2 left-2 z-10">
												<Badge variant="default" className="text-xs font-bold">
													{occasionData.occasion.toUpperCase()}
												</Badge>
											</div>
											<div className="absolute top-2 right-2 flex gap-1 z-10">
												<button 
													onClick={(e) => {
														e.stopPropagation();
														cycleOutfit(index);
													}}
													className="p-2 bg-white/90 rounded-full hover:bg-white shadow-sm"
													title={`Show next outfit (${occasionData.current_index + 1}/${occasionData.outfits.length})`}
												>
													<RefreshCw className="w-4 h-4" />
												</button>
											</div>
											
											{/* Display items in a grid */}
											<div className="grid grid-cols-2 gap-1 p-4 h-full">
												{outfit.items.slice(0, 4).map((item, idx) => (
													<div key={idx} className="relative bg-white rounded-lg overflow-hidden">
														<img
															src={`http://localhost:8000${item.image_url}`}
															alt={item.subcategory}
															className="w-full h-full object-cover"
															onError={(e) => {
																e.currentTarget.src = `https://via.placeholder.com/200x267/f5f5f5/666666?text=${encodeURIComponent(item.category)}`;
															}}
														/>
													</div>
												))}
											</div>
										</div>

										<CardHeader className="pb-3">
											<div className="flex items-start justify-between gap-2 mb-2">
												<CardTitle className="text-lg">{outfit.outfit_name}</CardTitle>
												{outfit.rank === 1 && (
													<Badge variant="default" className="text-xs bg-green-600">
														⭐ Top Pick
													</Badge>
												)}
											</div>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{outfit.outfit_description}
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												Option {occasionData.current_index + 1} of {occasionData.outfits.length}
											</p>
										</CardHeader>

										<CardContent className="space-y-2">
											{outfit.total_cost && (
												<div className="mb-2">
													<div className="flex items-center justify-between">
														<span className="text-xs font-medium text-muted-foreground">TOTAL BUDGET</span>
														<span className="text-lg font-bold text-green-600">
															₹{outfit.total_cost.amount?.toLocaleString('en-IN') || 0}
														</span>
													</div>
													{outfit.total_cost.savings ? (
														<p className="text-xs text-green-600">You save ₹{outfit.total_cost.savings.toLocaleString('en-IN')}!</p>
													) : null}
												</div>
											)}
											<Button
												className="w-full"
												variant="outline"
												onClick={() => setSelectedOccasionIndex(index)}
											>
												✨ Try It On
											</Button>
											<Button
												className="w-full"
												onClick={() => setSelectedOccasionIndex(index)}
											>
												View Items
											</Button>
										</CardContent>
									</Card>
									</motion.div>
								);
							})}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function SuggestionsPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
				<div className="text-center">
					<div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		}>
			<SuggestionsContent />
		</Suspense>
	);
}
