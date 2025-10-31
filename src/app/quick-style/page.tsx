"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type SavedProfile = {
	gender: string;
	ageGroup: string;
	occupation: string;
	heightCm: string;
	bodyType: string;
	preferredFit: string;
	favoriteColors: string;
};

const occasions = [
	{ value: "casual", label: "Casual", emoji: "👕", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
	{ value: "formal", label: "Formal", emoji: "👔", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
	{ value: "party", label: "Party", emoji: "🎉", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
	{ value: "date", label: "Date Night", emoji: "💕", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
	{ value: "business", label: "Business", emoji: "💼", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
	{ value: "workout", label: "Workout", emoji: "💪", color: "bg-green-100 text-green-700 hover:bg-green-200" },
	{ value: "wedding", label: "Wedding", emoji: "💒", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
	{ value: "vacation", label: "Vacation", emoji: "🏖️", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
];

export default function QuickStylePage() {
	const router = useRouter();
	const [profile, setProfile] = useState<SavedProfile | null>(null);
	const [itemPhoto, setItemPhoto] = useState<File | null>(null);
	const [itemPhotoPreview, setItemPhotoPreview] = useState<string | null>(null);
	const [selectedOccasion, setSelectedOccasion] = useState<string>("");
	const [customRequest, setCustomRequest] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		// Load saved profile
		const savedData = localStorage.getItem('styleQuizFormData');
		if (savedData) {
			try {
				const parsed = JSON.parse(savedData);
				if (parsed.basic?.gender && parsed.basic?.ageGroup && parsed.basic?.occupation) {
					setProfile({
						gender: parsed.basic.gender,
						ageGroup: parsed.basic.ageGroup,
						occupation: parsed.basic.occupation,
						heightCm: parsed.appearance?.heightCm || "",
						bodyType: parsed.appearance?.bodyType || "",
						preferredFit: parsed.style?.preferredFit || "",
						favoriteColors: parsed.style?.favoriteColors || "",
					});
				} else {
					// No complete profile, redirect to quiz
					router.push('/style-quiz');
				}
			} catch (e) {
				console.error('Error loading profile:', e);
				router.push('/style-quiz');
			}
		} else {
			// No saved data, redirect to quiz
			router.push('/style-quiz');
		}
	}, [router]);

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setItemPhoto(file);
			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setItemPhotoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleClearProfile = () => {
		if (confirm('Are you sure you want to clear your saved profile? You will need to fill out the style quiz again.')) {
			localStorage.removeItem('styleQuizFormData');
			sessionStorage.removeItem('styleQuizData');
			sessionStorage.removeItem('referenceImageBase64');
			router.push('/style-quiz');
		}
	};

	const handleSubmit = async () => {
		if (!selectedOccasion) {
			alert('Please select an occasion');
			return;
		}

		setIsSubmitting(true);

		try {
			// Prepare data for API
			const formData = {
				gender: profile?.gender,
				age_group: profile?.ageGroup,
				occupation: profile?.occupation,
				height: profile?.heightCm,
				body_type: profile?.bodyType,
				preferred_fit: profile?.preferredFit,
				colors: profile?.favoriteColors,
				occasion: selectedOccasion,
				custom_request: customRequest,
				reference_image_base64: null as string | null,
				reference_item_description: customRequest,
			};

			// Save to sessionStorage
			sessionStorage.setItem('styleQuizData', JSON.stringify(formData));

			// Convert photo to base64 if exists
			if (itemPhoto) {
				const reader = new FileReader();
				reader.onloadend = () => {
					const base64 = reader.result as string;
					const base64Data = base64.split(',')[1];
					sessionStorage.setItem('referenceImageBase64', base64Data);
					// Navigate to suggestions
					router.push(`/suggestions?bodyType=${profile?.bodyType || 'apple'}`);
				};
				reader.readAsDataURL(itemPhoto);
			} else {
				sessionStorage.removeItem('referenceImageBase64');
				router.push(`/suggestions?bodyType=${profile?.bodyType || 'apple'}`);
			}
		} catch (error) {
			console.error('Error submitting:', error);
			alert('Something went wrong. Please try again.');
			setIsSubmitting(false);
		}
	};

	if (!profile) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white">
				<div className="text-center">
					<div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
					<p className="text-muted-foreground">Loading your profile...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
			<div className="mx-auto max-w-4xl px-4 py-10">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-8 text-center"
				>
					<div className="mb-4 flex items-center justify-between">
						<Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
							← Back to Home
						</Link>
						<Button
							variant="outline"
							size="sm"
							onClick={handleClearProfile}
							className="text-red-600 hover:text-red-700 hover:bg-red-50"
						>
							🗑️ Clear Profile
						</Button>
					</div>
					<h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
						Welcome Back! 👋
					</h1>
					<p className="text-lg text-muted-foreground">
						Your profile is saved. Let's find your perfect outfit!
					</p>
				</motion.div>

				{/* Saved Profile Summary */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.5 }}
				>
					<Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<span>✨</span> Your Style Profile
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div>
									<p className="text-xs text-muted-foreground mb-1">Gender</p>
									<Badge variant="secondary" className="capitalize">{profile.gender}</Badge>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Age Group</p>
									<Badge variant="secondary">{profile.ageGroup}</Badge>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Body Type</p>
									<Badge variant="secondary" className="capitalize">{profile.bodyType || "Not set"}</Badge>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Occupation</p>
									<Badge variant="secondary">{profile.occupation}</Badge>
								</div>
							</div>
							{profile.favoriteColors && (
								<div className="mt-4">
									<p className="text-xs text-muted-foreground mb-1">Favorite Colors</p>
									<p className="text-sm font-medium">{profile.favoriteColors}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* Quick Style Form */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
				>
					<Card className="shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl">Quick Style Request</CardTitle>
							<p className="text-sm text-muted-foreground">
								Tell us what you're looking for and we'll create the perfect outfit
							</p>
						</CardHeader>
						<CardContent className="space-y-8">
							{/* Occasion Selection */}
							<div>
								<label className="block text-base font-semibold text-neutral-800 mb-4">
									What's the occasion? <span className="text-red-500">*</span>
								</label>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
									{occasions.map((occasion) => (
										<button
											key={occasion.value}
											type="button"
											onClick={() => setSelectedOccasion(occasion.value)}
											className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:scale-105 ${
												selectedOccasion === occasion.value
													? "border-purple-500 bg-purple-50 ring-2 ring-purple-200 shadow-md"
													: "border-neutral-200 bg-white hover:border-purple-300"
											}`}
										>
											<span className="text-3xl">{occasion.emoji}</span>
											<span className="text-sm font-medium text-center">{occasion.label}</span>
										</button>
									))}
								</div>
							</div>

							{/* Item Photo Upload */}
							<div>
								<label className="block text-base font-semibold text-neutral-800 mb-2">
									Have a specific item to style around? (Optional)
								</label>
								<p className="text-xs text-muted-foreground mb-3">
									Upload a photo of a clothing item and we'll build an outfit around it
								</p>
								
								<div className="space-y-3">
									<Input
										type="file"
										accept="image/*"
										onChange={handlePhotoChange}
										className="cursor-pointer"
									/>
									
									{itemPhotoPreview && (
										<div className="relative w-full max-w-xs mx-auto">
											<div className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-200 shadow-md">
												<Image
													src={itemPhotoPreview}
													alt="Item preview"
													fill
													className="object-cover"
												/>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => {
													setItemPhoto(null);
													setItemPhotoPreview(null);
												}}
												className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white hover:bg-red-600 p-0"
											>
												✕
											</Button>
										</div>
									)}
								</div>
							</div>

							{/* Custom Request */}
							<div>
								<label className="block text-base font-semibold text-neutral-800 mb-2">
									Any specific requests? (Optional)
								</label>
								<p className="text-xs text-muted-foreground mb-3">
									Tell us anything special you're looking for - colors, style, comfort level, etc.
								</p>
								<textarea
									placeholder="e.g., I want something comfortable but stylish, preferably in earth tones..."
									value={customRequest}
									onChange={(e) => setCustomRequest(e.target.value)}
									className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
								/>
							</div>

							{/* Submit Button */}
							<div className="pt-4 border-t">
								<Button
									onClick={handleSubmit}
									disabled={!selectedOccasion || isSubmitting}
									className="w-full py-6 text-lg"
									size="lg"
								>
									{isSubmitting ? (
										<>
											<div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
											Creating Your Outfits...
										</>
									) : (
										<>✨ Get My Style Suggestions</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Need to update profile? */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
					className="mt-6 text-center"
				>
					<p className="text-sm text-muted-foreground">
						Need to update your profile?{" "}
						<button
							onClick={handleClearProfile}
							className="text-purple-600 hover:text-purple-700 underline font-medium"
						>
							Clear and start over
						</button>
					</p>
				</motion.div>
			</div>
		</div>
	);
}

