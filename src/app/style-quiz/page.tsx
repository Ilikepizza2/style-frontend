"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import gsap from "gsap";
import { detectUndertoneWithCalibration } from "./color.util";

type BasicProfile = {
	gender: string;
	ageGroup: string;
	occupation: string;
};

type ColorAnalysis = {
	undertone: string;
	skinTone: string;
	score: number;
	calibratedColors: {
		skin: string;
		hair: string;
		eye: string;
	};
	manualOverride?: boolean;
};

type SkinTone = {
	selfieImage: File | null;
	skinColor: string;
	hairColor: string;
	eyeColor: string;
	colorAnalysis: ColorAnalysis | null;
};

type Appearance = {
	heightCm: string;
	bodyType: string;
	heightUnit: 'inch' | 'cm';
};

type FormData = {
	basic: BasicProfile;
	skinTone: SkinTone;
	appearance: Appearance;
};

const initialData: FormData = {
	basic: { gender: "female", ageGroup: "", occupation: "" },
	skinTone: { selfieImage: null, skinColor: "", hairColor: "", eyeColor: "", colorAnalysis: null },
	appearance: { heightCm: "", bodyType: "", heightUnit: "inch" },
};

const steps = [
	{ key: "basic", label: "Tell Us about Yourself" },
	{ key: "skinTone", label: "Skin Tone Analysis" },
	{ key: "appearance", label: "Your Appearance" },
] as const;

const ageGroups = ["<18", "18 - 25", "26 - 35", "36 - 45", "45+"];
const occupations = ["College Student", "Working Professional", "School Student", "Parent", "Other"];

type StepKey = (typeof steps)[number]["key"];

function isBasicDone(basic: BasicProfile) {
	return basic.gender.trim().length > 0 && basic.ageGroup.trim().length > 0 && basic.occupation.trim().length > 0;
}

function isSkinToneDone(skinTone: SkinTone): boolean {
	// Either manual color analysis OR all three colors picked
	const hasManualAnalysis = !!(skinTone.colorAnalysis?.undertone && skinTone.colorAnalysis?.skinTone);
	const hasColors = !!(skinTone.skinColor && skinTone.hairColor && skinTone.eyeColor);
	return hasManualAnalysis || hasColors;
}

function isAppearanceDone(appearance: Appearance): boolean {
	const hasHeight = appearance.heightUnit === 'inch'
		? (appearance.heightCm.includes("'") && appearance.heightCm.includes('"')) || appearance.heightCm === "not-accurate"
		: appearance.heightCm.trim().length > 0 || appearance.heightCm === "not-accurate";
	return hasHeight && appearance.bodyType.trim().length > 0;
}

const StyleQuizPage = () => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [data, setData] = useState<FormData>(initialData);
	const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
	const stepRefs = useRef<HTMLDivElement[]>([]);
	const [selfiePreview, setSelfiePreview] = useState<string>("");
	const [activeColorPicker, setActiveColorPicker] = useState<'skin' | 'hair' | 'eye' | null>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [currentPickedColor, setCurrentPickedColor] = useState<string>("");
	const [autoProgressEnabled, setAutoProgressEnabled] = useState(true);
	const [hasInteracted, setHasInteracted] = useState(false);
	const [showManualControls, setShowManualControls] = useState(false);

	const completed: Record<StepKey, boolean> = useMemo(
		() => ({
			basic: isBasicDone(data.basic),
			skinTone: isSkinToneDone(data.skinTone),
			appearance: isAppearanceDone(data.appearance),
		}),
		[data],
	);

	const currentKey = steps[currentStepIndex].key;

	function next() {
		setCurrentStepIndex((idx) => Math.min(idx + 1, steps.length - 1));
	}

	function back() {
		setCurrentStepIndex((idx) => Math.max(idx - 1, 0));
	}

	function update<K extends StepKey, T extends FormData[K]>(key: K, values: Partial<T>) {
		setData((prev) => ({
			...prev,
			[key]: { ...prev[key], ...values },
		}));
	}

	// Extract color from image at given position
	const getColorAtPosition = (x: number, y: number): string | null => {
		if (!imageRef.current) return null;
		
		const img = imageRef.current;
		const rect = img.getBoundingClientRect();
		
		// Calculate the actual rendered image dimensions (accounting for object-contain)
		const naturalRatio = img.naturalWidth / img.naturalHeight;
		const containerRatio = rect.width / rect.height;
		
		let renderedWidth, renderedHeight, offsetX, offsetY;
		
		if (naturalRatio > containerRatio) {
			// Image is wider - will have top/bottom padding
			renderedWidth = rect.width;
			renderedHeight = rect.width / naturalRatio;
			offsetX = 0;
			offsetY = (rect.height - renderedHeight) / 2;
		} else {
			// Image is taller - will have left/right padding
			renderedHeight = rect.height;
			renderedWidth = rect.height * naturalRatio;
			offsetX = (rect.width - renderedWidth) / 2;
			offsetY = 0;
		}
		
		// Adjust coordinates relative to the actual rendered image
		const imageX = x - offsetX;
		const imageY = y - offsetY;
		
		// Check if click is within the rendered image bounds
		if (imageX < 0 || imageY < 0 || imageX > renderedWidth || imageY > renderedHeight) {
			return null;
		}
		
		// Scale to natural image size
		const scaleX = img.naturalWidth / renderedWidth;
		const scaleY = img.naturalHeight / renderedHeight;
		
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return null;
		
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;
		ctx.drawImage(img, 0, 0);
		
		const pixelX = Math.floor(imageX * scaleX);
		const pixelY = Math.floor(imageY * scaleY);
		const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;
		
		// Convert to hex
		const hex = `#${((1 << 24) + (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]).toString(16).slice(1)}`;
		return hex;
	};

	// Handle color picking from image
	const handleColorPick = (clientX: number, clientY: number) => {
		if (!activeColorPicker || !imageRef.current) return;
		
		const rect = imageRef.current.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;
		
		// Ensure coordinates are within image bounds
		if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
		
		setPickerPosition({ x, y });
		
		const hex = getColorAtPosition(x, y);
		if (!hex) return;
		
		setCurrentPickedColor(hex);
		
		if (activeColorPicker === 'skin') {
			update("skinTone", { skinColor: hex });
		} else if (activeColorPicker === 'hair') {
			update("skinTone", { hairColor: hex });
		} else if (activeColorPicker === 'eye') {
			update("skinTone", { eyeColor: hex });
		}
	};

	// Auto-progress to next color picker
	const progressToNextColor = () => {
		if (!autoProgressEnabled || !hasInteracted) return;
		
		if (activeColorPicker === 'skin' && data.skinTone.skinColor) {
			setActiveColorPicker('hair');
			setPickerPosition(null);
		} else if (activeColorPicker === 'hair' && data.skinTone.hairColor) {
			setActiveColorPicker('eye');
			setPickerPosition(null);
		} else if (activeColorPicker === 'eye' && data.skinTone.eyeColor) {
			// All colors selected, deactivate picker
			setActiveColorPicker(null);
			setPickerPosition(null);
		}
	};

	// Load data from localStorage on mount and redirect if exists
	useEffect(() => {
		if (typeof window !== 'undefined' && !hasLoadedFromStorage) {
			const savedData = localStorage.getItem('styleQuizFormData');
			if (savedData) {
				try {
					const parsed = JSON.parse(savedData);
					// Check if the saved data is complete (has basic profile filled)
					if (parsed.basic?.gender && parsed.basic?.ageGroup && parsed.basic?.occupation) {
						// Redirect to quick customize page if profile exists
						window.location.href = '/quick-style';
						return;
					}
				} catch (e) {
					console.error('Error loading saved form data:', e);
				}
			}
			setHasLoadedFromStorage(true);
		}
	}, [hasLoadedFromStorage]);

	// Save data to localStorage whenever it changes (except selfieImage)
	useEffect(() => {
		if (typeof window !== 'undefined' && hasLoadedFromStorage) {
			// Create a copy without the File object (can't be stringified)
			const dataToSave = {
				basic: data.basic,
				skinTone: {
					skinColor: data.skinTone.skinColor,
					hairColor: data.skinTone.hairColor,
					eyeColor: data.skinTone.eyeColor,
					colorAnalysis: data.skinTone.colorAnalysis,
					// Don't save selfieImage File object
					selfieImage: null,
				},
				appearance: {
					heightCm: data.appearance.heightCm,
					bodyType: data.appearance.bodyType,
					heightUnit: data.appearance.heightUnit,
				}
			};
			localStorage.setItem('styleQuizFormData', JSON.stringify(dataToSave));
		}
	}, [data, hasLoadedFromStorage]);

	const resetFormData = () => {
		if (confirm('Are you sure you want to clear all saved data and start fresh?')) {
			localStorage.removeItem('styleQuizFormData');
			sessionStorage.removeItem('styleQuizData');
			sessionStorage.removeItem('referenceImageBase64');
			setData(initialData);
			setCurrentStepIndex(0);
			setSelfiePreview("");
			setActiveColorPicker(null);
			setPickerPosition(null);
			setCurrentPickedColor("");
			setAutoProgressEnabled(true);
			setHasInteracted(false);
			setShowManualControls(false);
		}
	};

	function StepBadge({ index, label, done, active }: { index: number; label: string; done: boolean; active: boolean }) {
		return (
			<div className="flex items-center gap-3">
				<motion.div
					className="relative rounded-full p-[2px]"
					style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}
					animate={{ scale: active ? 1.05 : 1, boxShadow: active ? "0 0 0 4px rgba(236,72,153,0.08)" : "0 0 0 0 rgba(0,0,0,0)" }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
				>
					<div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white">
						{done ? (
							<Image
								src="/assets/icons/tick.png"
								alt="completed"
								fill
								sizes="48px"
								className="p-2 object-contain"
							/>
						) : (
							<span className={`text-sm ${active ? "text-indigo-600" : "text-neutral-500"}`}>{String(index).padStart(2, "0")}</span>
						)}
					</div>
				</motion.div>
				<span className={`text-sm ${active ? "font-medium text-neutral-900" : "text-neutral-500"}`}>{label}</span>
			</div>
		);
	}

	function Connector({ progress }: { progress: number }) {
		const ref = useRef<HTMLDivElement | null>(null);
		useEffect(() => {
			if (!ref.current) return;
			gsap.to(ref.current, { opacity: progress > 0 ? 1 : 0.6, duration: 0.3 });
		}, [progress]);
		return (
			<div className="mx-4 hidden h-0.5 flex-1 sm:block">
				<div
					className="h-full w-full"
					style={{
						backgroundImage: `repeating-linear-gradient(90deg, #ec4899 0 8px, transparent 8px 16px)`,
					}}
				/>
				<motion.div
					ref={ref}
					className="-mt-0.5 h-0.5"
					style={{ background: "linear-gradient(90deg,#ec4899,#8b5cf6)" }}
					initial={false}
					animate={{ width: `${progress}%` }}
					transition={{ duration: 0.6, ease: "easeInOut" }}
				/>
			</div>
		);
	}

	useEffect(() => {
		const el = stepRefs.current[currentStepIndex];
		if (!el) return;
		gsap.fromTo(el, { scale: 0.98 }, { scale: 1, duration: 0.4, ease: "power2.out" });
	}, [currentStepIndex]);

	// Compute skin tone and undertone analysis when all colors are selected
	useEffect(() => {
		if (data.skinTone.skinColor && data.skinTone.hairColor && data.skinTone.eyeColor) {
			// Don't override if user has manually set values
			if (data.skinTone.colorAnalysis?.manualOverride) {
				console.log('Skipping auto-detection: User has manually selected values');
				return;
			}
			
			try {
				const result = detectUndertoneWithCalibration(
					data.skinTone.skinColor,
					data.skinTone.hairColor,
					data.skinTone.eyeColor,
					{}
				);
				
				const analysis: ColorAnalysis = {
					undertone: result.undertone,
					skinTone: result.skinTone,
					score: result.score,
					calibratedColors: {
						skin: result.calibrated.skinHex,
						hair: result.calibrated.hairHex || data.skinTone.hairColor,
						eye: result.calibrated.eyeHex || data.skinTone.eyeColor,
					},
					manualOverride: false,
				};
				
				// Only update if analysis has changed
				if (JSON.stringify(data.skinTone.colorAnalysis) !== JSON.stringify(analysis)) {
					update("skinTone", { colorAnalysis: analysis });
				}
				
				console.log('Color Analysis:', analysis);
			} catch (error) {
				console.error('Error analyzing colors:', error);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data.skinTone.skinColor, data.skinTone.hairColor, data.skinTone.eyeColor]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
			<div className="w-full px-3 sm:px-4 py-6 sm:py-10">
			<div className="mx-auto max-w-6xl mb-6 sm:mb-8 flex items-center justify-between">
				{steps.map((s, i) => {
					const connectorProgress = i === 0 ? (currentStepIndex > 0 ? 100 : completed.basic ? 100 : 0) : i === 1 ? (currentStepIndex > 1 ? 100 : completed.skinTone ? 100 : 0) : 0;
					return (
						<div
							key={s.key}
							className="flex flex-1 items-center"
							ref={(node) => {
								if (node) stepRefs.current[i] = node;
							}}
						>
							<StepBadge
								index={i + 1}
								label={s.label}
								done={completed[s.key]}
								active={i === currentStepIndex}
							/>
							{i < steps.length - 1 && <Connector progress={connectorProgress} />}
						</div>
					);
				})}
			</div>

			<Card className="w-full">
				<CardHeader>
					<div className="flex flex-col gap-3 sm:gap-4">
						<div className="flex items-center justify-between">
							<Link href="/" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 sm:gap-2">
								← Back
							</Link>
							<Button
								variant="outline"
								size="sm"
								onClick={resetFormData}
								className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3"
								title="Clear all saved data and start fresh"
							>
								🔄 Reset
							</Button>
						</div>
						<CardTitle className="text-center text-2xl sm:text-3xl font-bold">
							{currentKey === "basic" && "Tell Us About Yourself"}
							{currentKey === "skinTone" && "Skin Tone Analysis"}
							{currentKey === "appearance" && "Your Appearance"}
						</CardTitle>
						<p className="text-center text-xs sm:text-sm text-muted-foreground px-2">
							{currentKey === "basic" && "Let's start with some basic information to personalize your experience"}
							{currentKey === "skinTone" && "Upload a selfie to analyze your unique color profile for personalized recommendations"}
							{currentKey === "appearance" && "Help us understand your body type to recommend the most flattering styles"}
						</p>
					</div>
				</CardHeader>
				<CardContent className="min-h-[700px] space-y-20 py-12">
					{currentKey === "basic" && (
						<>
							{/* Gender Selection */}
							<div className="space-y-6 sm:space-y-8">
								<label className="block text-center text-base sm:text-lg font-medium text-neutral-800">
									What's your gender? <span className="text-red-500">*</span>
								</label>
								<div className="flex justify-center gap-8 sm:gap-16">
									<button
										type="button"
										onClick={() => update("basic", { gender: "male" })}
										className="group flex flex-col items-center gap-2 sm:gap-3"
									>
										<div
											className={`relative h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 overflow-hidden rounded-full transition-all ${data.basic.gender === "male"
												? "ring-4 ring-cyan-400"
												: "ring-2 ring-transparent hover:ring-cyan-200"
												}`}
										>
											<Image
												src="/assets/gender/male.png"
												alt="Male"
												fill
												className="object-cover"
											/>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs sm:text-sm text-neutral-700">Male</span>
											<div
												className={`h-5 w-5 rounded-full border-2 ${data.basic.gender === "male"
													? "border-cyan-400 bg-cyan-400"
													: "border-neutral-300"
													}`}
											>
												{data.basic.gender === "male" && (
													<div className="flex h-full w-full items-center justify-center">
														<div className="h-2 w-2 rounded-full bg-white" />
													</div>
												)}
											</div>
										</div>
									</button>

									<button
										type="button"
										onClick={() => update("basic", { gender: "female" })}
										className="group flex flex-col items-center gap-2 sm:gap-3"
									>
										<div
											className={`relative h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 overflow-hidden rounded-full transition-all ${data.basic.gender === "female"
												? "ring-4 ring-purple-500"
												: "ring-2 ring-transparent hover:ring-purple-200"
												}`}
										>
											<Image
												src="/assets/gender/female.png"
												alt="Female"
												fill
												className="object-cover"
											/>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs sm:text-sm text-neutral-700">Female</span>
											<div
												className={`h-5 w-5 rounded-full border-2 ${data.basic.gender === "female"
													? "border-purple-500 bg-purple-500"
													: "border-neutral-300"
													}`}
											>
												{data.basic.gender === "female" && (
													<div className="flex h-full w-full items-center justify-center">
														<div className="h-2 w-2 rounded-full bg-white" />
													</div>
												)}
											</div>
										</div>
									</button>
								</div>
							</div>

							{/* Age Group Selection */}
							<div className="space-y-6">
								<label className="block text-center text-base font-medium text-neutral-700">
									What's your age group? <span className="text-red-500">*</span>
								</label>
								<div className="flex flex-wrap justify-center gap-3">
									{ageGroups.map((age) => (
										<button
											key={age}
											type="button"
											onClick={() => update("basic", { ageGroup: age })}
											className={`rounded-full border-2 px-6 py-2 text-sm transition-all ${data.basic.ageGroup === age
												? "border-purple-500 bg-purple-500 text-white"
												: "border-neutral-300 text-neutral-600 hover:border-purple-300"
												}`}
										>
											{age}
										</button>
									))}
								</div>
							</div>

							{/* Occupation Selection */}
							<div className="space-y-6">
								<label className="block text-center text-base font-medium text-neutral-700">
									What best describes you? <span className="text-red-500">*</span>
								</label>
								<div className="flex flex-wrap justify-center gap-3">
									{occupations.map((occ) => (
										<button
											key={occ}
											type="button"
											onClick={() => update("basic", { occupation: occ })}
											className={`rounded-full border-2 px-6 py-2 text-sm transition-all ${data.basic.occupation === occ
												? "border-purple-500 bg-purple-500 text-white"
												: "border-neutral-300 text-neutral-600 hover:border-purple-300"
												}`}
										>
											{occ}
										</button>
									))}
								</div>
							</div>
						</>
					)}

					{currentKey === "skinTone" && (
						<div className="space-y-8">
							<div className="text-center space-y-2">
								<label className="block text-lg font-medium text-neutral-700">
									Your Color Profile <span className="text-red-500">*</span>
								</label>
								<p className="text-sm text-neutral-500">
									Upload a selfie and select your skin, hair, and eye colors for personalized recommendations
								</p>
							</div>

							{!selfiePreview ? (
								<div className="space-y-6">
									<div className="max-w-2xl mx-auto">
										<div className="relative rounded-2xl border-2 border-dashed border-neutral-300 bg-gradient-to-b from-neutral-50 to-white p-8 sm:p-12 transition-all hover:border-purple-300 hover:bg-purple-50/30">
											<input
												type="file"
												accept="image/*"
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) {
														update("skinTone", { selfieImage: file });
														const reader = new FileReader();
														reader.onloadend = () => {
															setSelfiePreview(reader.result as string);
															// Automatically start with skin color picker
															setActiveColorPicker('skin');
															setAutoProgressEnabled(true);
															setHasInteracted(false);
														};
														reader.readAsDataURL(file);
													}
												}}
												className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
												id="selfie-upload"
											/>
											<div className="flex flex-col items-center gap-4 pointer-events-none">
												<div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6">
													<svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
													</svg>
												</div>
												<div className="text-center">
													<p className="text-base font-medium text-neutral-700 mb-1">
														Choose a Photo
													</p>
													<p className="text-sm text-neutral-500">
														Upload or take a selfie showing your face clearly
													</p>
												</div>
												<Button 
													type="button"
													className="pointer-events-none bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
													size="lg"
												>
													Select Photo
												</Button>
											</div>
										</div>
									</div>

									{/* Manual Selection Option - Only show if auto-analysis not complete */}
									{!data.skinTone.colorAnalysis?.undertone || !data.skinTone.colorAnalysis?.skinTone || data.skinTone.colorAnalysis?.manualOverride ? (
										<div className="text-center">
											<button
												type="button"
												onClick={() => setShowManualControls(!showManualControls)}
												className="text-sm text-neutral-600 hover:text-neutral-800 underline inline-flex items-center gap-1"
											>
												{showManualControls ? '↑ Hide' : '↓ Or select manually'}
											</button>
										</div>
									) : null}

									{/* Manual Controls - Collapsible */}
									{showManualControls && (
										<div className="max-w-2xl mx-auto">
											<div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-3">
												<div className="text-sm font-medium text-neutral-700">
													Manual Selection
												</div>
												
												{/* Undertone Selection */}
												<div className="space-y-2">
													<label className="text-xs font-medium text-neutral-600">Undertone *</label>
													<div className="flex gap-2">
														{['warm', 'neutral', 'cool'].map((tone) => (
															<button
																key={tone}
																type="button"
																onClick={() => {
																	const currentAnalysis = data.skinTone.colorAnalysis;
																	update("skinTone", {
																		colorAnalysis: {
																			undertone: tone,
																			skinTone: currentAnalysis?.skinTone || 'medium',
																			score: currentAnalysis?.score || 0,
																			calibratedColors: currentAnalysis?.calibratedColors || {
																				skin: data.skinTone.skinColor,
																				hair: data.skinTone.hairColor,
																				eye: data.skinTone.eyeColor,
																			},
																			manualOverride: true,
																		}
																	});
																}}
																className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
																	data.skinTone.colorAnalysis?.undertone === tone
																		? 'bg-purple-600 text-white shadow-sm'
																		: 'bg-white text-neutral-700 border border-neutral-300 hover:border-purple-300'
																}`}
															>
																{tone.charAt(0).toUpperCase() + tone.slice(1)}
															</button>
														))}
													</div>
												</div>

												{/* Skin Tone Selection */}
												<div className="space-y-2">
													<label className="text-xs font-medium text-neutral-600">Skin Tone *</label>
													<div className="grid grid-cols-3 gap-2">
														{['very light', 'light', 'medium', 'tan', 'deep'].map((tone) => (
															<button
																key={tone}
																type="button"
																onClick={() => {
																	const currentAnalysis = data.skinTone.colorAnalysis;
																	update("skinTone", {
																		colorAnalysis: {
																			undertone: currentAnalysis?.undertone || 'neutral',
																			skinTone: tone,
																			score: currentAnalysis?.score || 0,
																			calibratedColors: currentAnalysis?.calibratedColors || {
																				skin: data.skinTone.skinColor,
																				hair: data.skinTone.hairColor,
																				eye: data.skinTone.eyeColor,
																			},
																			manualOverride: true,
																		}
																	});
																}}
																className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
																	data.skinTone.colorAnalysis?.skinTone === tone
																		? 'bg-purple-600 text-white shadow-sm'
																		: 'bg-white text-neutral-700 border border-neutral-300 hover:border-purple-300'
																}`}
															>
																{tone.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
															</button>
														))}
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="max-w-4xl mx-auto space-y-6">
									<div className="flex items-center justify-between">
										<h3 className="text-base font-medium text-neutral-700">
											Select Your Colors
										</h3>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												setSelfiePreview("");
												update("skinTone", { 
													selfieImage: null, 
													skinColor: "", 
													hairColor: "", 
													eyeColor: "" 
												});
												setActiveColorPicker(null);
												setPickerPosition(null);
												setCurrentPickedColor("");
												setAutoProgressEnabled(true);
												setHasInteracted(false);
												setShowManualControls(false);
											}}
											className="text-xs"
										>
											Change Photo
										</Button>
									</div>

									<p className="text-sm text-neutral-600">
										Click on your photo to pick colors for each feature. Choose the most prominent tones.
									</p>

									<div className="grid md:grid-cols-[2fr,1fr] gap-6">
										{/* Image with Color Picker */}
										<div className="relative rounded-xl overflow-hidden bg-neutral-100 border-2 border-neutral-200 select-none">
											<img
												ref={imageRef}
												src={selfiePreview}
												alt="Your selfie"
												className="w-full h-auto max-h-[500px] object-contain touch-none"
												style={{ cursor: activeColorPicker ? 'crosshair' : 'default' }}
												draggable={false}
												onMouseDown={(e) => {
													if (!activeColorPicker) return;
													e.preventDefault();
													setIsDragging(true);
													setHasInteracted(true);
													handleColorPick(e.clientX, e.clientY);
												}}
												onMouseMove={(e) => {
													if (!activeColorPicker || !isDragging) return;
													e.preventDefault();
													handleColorPick(e.clientX, e.clientY);
												}}
												onMouseUp={() => {
													setIsDragging(false);
													progressToNextColor();
												}}
												onMouseLeave={() => {
													if (isDragging) {
														setIsDragging(false);
														progressToNextColor();
													}
												}}
												onTouchStart={(e) => {
													if (!activeColorPicker) return;
													e.preventDefault();
													setIsDragging(true);
													setHasInteracted(true);
													const touch = e.touches[0];
													handleColorPick(touch.clientX, touch.clientY);
												}}
												onTouchMove={(e) => {
													if (!activeColorPicker) return;
													e.preventDefault();
													const touch = e.touches[0];
													handleColorPick(touch.clientX, touch.clientY);
												}}
												onTouchEnd={() => {
													setIsDragging(false);
													progressToNextColor();
												}}
											/>
											
											{/* Color Picker Circle */}
											{activeColorPicker && pickerPosition && (
												<div
													className="absolute pointer-events-none"
													style={{
														left: `${pickerPosition.x}px`,
														top: `${pickerPosition.y}px`,
														transform: 'translate(-50%, -50%)',
													}}
												>
													{/* Picker design: transparent center, colored outer ring */}
													<div className="relative w-20 h-20">
														{/* Outer colored ring with the selected color */}
														<div
															className="absolute inset-0 rounded-full border-[6px] shadow-lg"
															style={{
																borderColor: currentPickedColor,
															}}
														/>
														{/* White border inside */}
														<div className="absolute inset-0 rounded-full border-2 border-white" style={{ margin: '6px' }} />
														{/* Transparent center - user can see through */}
														<div className="absolute inset-0 rounded-full" style={{ margin: '8px' }} />
														{/* Center crosshair */}
														<div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
															<div className="w-2 h-[1px] bg-white shadow-sm absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }} />
															<div className="h-2 w-[1px] bg-white shadow-sm absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }} />
														</div>
													</div>
												</div>
											)}
											
											{activeColorPicker && (
												<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
													{pickerPosition ? 'Drag' : 'Click or drag'} on your {activeColorPicker === 'skin' ? 'skin' : activeColorPicker === 'hair' ? 'hair' : 'eye'} to pick color
												</div>
											)}
										</div>

										{/* Color Selection Panel */}
										<div className="space-y-3">
											{[
												{ key: 'skin', label: 'Skin', color: data.skinTone.skinColor },
												{ key: 'hair', label: 'Hair', color: data.skinTone.hairColor },
												{ key: 'eye', label: 'Eye', color: data.skinTone.eyeColor },
											].map((item) => (
												<button
													key={item.key}
													type="button"
													onClick={() => {
														// Disable auto-progression when user manually selects
														setAutoProgressEnabled(false);
														setActiveColorPicker(item.key as 'skin' | 'hair' | 'eye');
														setPickerPosition(null);
													}}
													className={`w-full rounded-xl border-2 p-4 transition-all text-left ${
														activeColorPicker === item.key
															? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
															: item.color
															? 'border-neutral-200 hover:border-purple-300'
															: 'border-neutral-300 hover:border-purple-300'
													}`}
												>
													<div className="flex items-center gap-3">
														<div
															className={`w-16 h-16 rounded-lg border-2 transition-all ${
																item.color ? 'border-neutral-300' : 'border-dashed border-neutral-300 bg-neutral-50'
															}`}
															style={{ backgroundColor: item.color || 'transparent' }}
														>
															{!item.color && (
																<div className="flex items-center justify-center h-full">
																	<svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
																	</svg>
																</div>
															)}
														</div>
														<div className="flex-1">
															<div className="font-medium text-neutral-800">{item.label}</div>
															{item.color ? (
																<div className="text-xs text-neutral-500 font-mono mt-0.5">
																	{item.color.toUpperCase()}
																</div>
															) : (
																<div className="text-xs text-neutral-500 mt-0.5">
																	Click to select
																</div>
															)}
														</div>
														{activeColorPicker === item.key && (
															<div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
														)}
													</div>
												</button>
											))}

											{data.skinTone.skinColor && data.skinTone.hairColor && data.skinTone.eyeColor && (
												<>
													<div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
														<div className="flex items-center gap-2 text-green-700 text-sm">
															<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
																<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
															</svg>
															<span className="font-medium">Color profile complete!</span>
														</div>
													</div>
													
													{data.skinTone.colorAnalysis && (
														<div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-200 space-y-3">
															<div className="flex items-center justify-between">
																<div className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
																	{data.skinTone.colorAnalysis.manualOverride ? 'Your Selection' : 'Auto-Detected'}
																</div>
																{data.skinTone.colorAnalysis.manualOverride && (
																	<button
																		type="button"
																		onClick={() => {
																			// Re-run auto-detection
																			try {
																				const result = detectUndertoneWithCalibration(
																					data.skinTone.skinColor,
																					data.skinTone.hairColor,
																					data.skinTone.eyeColor,
																					{}
																				);
																				
																				update("skinTone", {
																					colorAnalysis: {
																						undertone: result.undertone,
																						skinTone: result.skinTone,
																						score: result.score,
																						calibratedColors: {
																							skin: result.calibrated.skinHex,
																							hair: result.calibrated.hairHex || data.skinTone.hairColor,
																							eye: result.calibrated.eyeHex || data.skinTone.eyeColor,
																						},
																						manualOverride: false,
																					}
																				});
																			} catch (error) {
																				console.error('Error analyzing colors:', error);
																			}
																		}}
																		className="text-xs text-purple-600 hover:text-purple-700 underline"
																	>
																		↻ Reset to Auto
																	</button>
																)}
															</div>
															
															{/* Undertone Selection */}
															<div className="space-y-2">
																<label className="text-xs font-medium text-purple-700">Undertone</label>
																<div className="flex gap-2">
																	{['warm', 'neutral', 'cool'].map((tone) => (
																		<button
																			key={tone}
																			type="button"
																			onClick={() => {
																				if (data.skinTone.colorAnalysis) {
																					update("skinTone", {
																						colorAnalysis: {
																							...data.skinTone.colorAnalysis,
																							undertone: tone,
																							manualOverride: true,
																						}
																					});
																				}
																			}}
																			className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
																				data.skinTone.colorAnalysis?.undertone === tone
																					? 'bg-purple-600 text-white shadow-sm'
																					: 'bg-white text-purple-700 border border-purple-200 hover:border-purple-400'
																			}`}
																		>
																			{tone.charAt(0).toUpperCase() + tone.slice(1)}
																		</button>
																	))}
																</div>
															</div>

															{/* Skin Tone Selection */}
															<div className="space-y-2">
																<label className="text-xs font-medium text-purple-700">Skin Tone</label>
																<div className="grid grid-cols-3 gap-2">
																	{['very light', 'light', 'medium', 'tan', 'deep'].map((tone) => (
																		<button
																			key={tone}
																			type="button"
																			onClick={() => {
																				if (data.skinTone.colorAnalysis) {
																					update("skinTone", {
																						colorAnalysis: {
																							...data.skinTone.colorAnalysis,
																							skinTone: tone,
																							manualOverride: true,
																						}
																					});
																				}
																			}}
																			className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
																				data.skinTone.colorAnalysis?.skinTone === tone
																					? 'bg-purple-600 text-white shadow-sm'
																					: 'bg-white text-purple-700 border border-purple-200 hover:border-purple-400'
																			}`}
																		>
																			{tone.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
																		</button>
																	))}
																</div>
															</div>

															{!data.skinTone.colorAnalysis.manualOverride && (
																<div className="text-xs text-purple-600 italic pt-1">
																	Click to adjust if the detection seems incorrect
																</div>
															)}
														</div>
													)}
												</>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{currentKey === "appearance" && (
						<div className="space-y-16">
							{/* Body Type Selection */}
							<div className="space-y-6 sm:space-y-8">
								<label className="block text-center text-base sm:text-lg font-medium text-neutral-700">
									What best describes your body type? <span className="text-red-500">*</span>
								</label>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 max-w-4xl mx-auto">
									{[
										{ key: "rectangle", label: "Rectangle", image: "/assets/body-shape/rectangle.png" },
										{ key: "inverted", label: "Inverted", image: "/assets/body-shape/inverted.png" },
										{ key: "pear", label: "Pear", image: "/assets/body-shape/pear.png" },
										{ key: "apple", label: "Apple", image: "/assets/body-shape/apple.png" },
										{ key: "hourglass", label: "Hourglass", image: "/assets/body-shape/hourglass.png" },
									].map((bodyType) => (
										<button
											key={bodyType.key}
											type="button"
											onClick={() => update("appearance", { bodyType: bodyType.key })}
											className={`group relative flex flex-col items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 transition-all hover:border-purple-300 hover:shadow-md cursor-pointer ${
												data.appearance.bodyType === bodyType.key
													? "border-purple-500 bg-gradient-to-b from-purple-50 to-pink-50 ring-2 ring-purple-200 shadow-md"
													: "border-neutral-200 bg-white hover:bg-neutral-50"
											}`}
										>
											<div className="relative h-32 w-full sm:h-64 md:h-96 sm:w-32 md:w-40">
												<Image
													src={bodyType.image}
													alt={bodyType.label}
													fill
													className="object-contain"
													sizes="(max-width: 640px) 128px, (max-width: 768px) 256px, 384px"
												/>
											</div>
											<span className={`text-xs sm:text-sm font-medium text-center ${
												data.appearance.bodyType === bodyType.key
													? "text-purple-700"
													: "text-neutral-600"
											}`}>
												{bodyType.label}
											</span>
											<div className={`absolute -top-1 -right-1 h-6 w-6 rounded-full border-2 transition-all ${
												data.appearance.bodyType === bodyType.key
													? "border-purple-500 bg-purple-500"
													: "border-neutral-300 bg-white group-hover:border-purple-300"
											}`}>
												{data.appearance.bodyType === bodyType.key && (
													<div className="flex h-full w-full items-center justify-center">
														<div className="h-2 w-2 rounded-full bg-white" />
													</div>
												)}
											</div>
										</button>
									))}
								</div>
								<div className="flex justify-center">
									<button
										type="button"
										onClick={() => update("appearance", { bodyType: "prefer-not-to-say" })}
										className={`rounded-lg px-6 py-3 text-sm transition-all ${
											data.appearance.bodyType === "prefer-not-to-say"
												? "bg-purple-100 text-purple-700 ring-2 ring-purple-200"
												: "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
										}`}
									>
										Prefer Not to say
									</button>
								</div>
							</div>

							{/* Height Selection */}
							<div className="space-y-8">
								<label className="block text-center text-lg font-medium text-neutral-700">
									What's your height? <span className="text-red-500">*</span>
								</label>

								{/* Unit Toggle */}
								<div className="flex justify-center">
									<div className="flex rounded-lg bg-neutral-100 p-1">
										<button
											type="button"
											onClick={() => update("appearance", { heightUnit: "inch", heightCm: "" })}
											className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
												data.appearance.heightUnit === "inch"
													? "bg-white text-neutral-900 shadow-sm"
													: "text-neutral-500 hover:text-neutral-700"
											}`}
										>
											Inch
										</button>
										<button
											type="button"
											onClick={() => update("appearance", { heightUnit: "cm", heightCm: "" })}
											className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
												data.appearance.heightUnit === "cm"
													? "bg-white text-neutral-900 shadow-sm"
													: "text-neutral-500 hover:text-neutral-700"
											}`}
										>
											CM
										</button>
									</div>
								</div>

								{/* Height Inputs */}
								{data.appearance.heightUnit === "inch" ? (
									<div className="flex justify-center gap-8 max-w-md mx-auto">
						<div className="flex-1">
							<label className="mb-2 block text-sm text-neutral-600 text-center font-medium">Feet</label>
							<Input
								type="number"
								placeholder="5"
								className="text-center text-lg"
								min="3"
								max="8"
								value={data.appearance.heightCm.split("'")[0] || ""}
								onChange={(e) => {
									const feet = e.target.value;
									const inches = data.appearance.heightCm.split("'")[1]?.replace('"', '') || '';
									update("appearance", { heightCm: `${feet}'${inches}"` });
								}}
							/>
						</div>
						<div className="flex-1">
							<label className="mb-2 block text-sm text-neutral-600 text-center font-medium">Inches</label>
							<Input
								type="number"
								placeholder="6"
								className="text-center text-lg"
								min="0"
								max="11"
								value={data.appearance.heightCm.split("'")[1]?.replace('"', '') || ""}
								onChange={(e) => {
									const inches = e.target.value;
									const feet = data.appearance.heightCm.split("'")[0] || '';
									update("appearance", { heightCm: `${feet}'${inches}"` });
								}}
							/>
						</div>
									</div>
								) : (
									<div className="flex justify-center max-w-md mx-auto">
										<div className="w-full">
											<label className="mb-2 block text-sm text-neutral-600 text-center font-medium">Centimeters</label>
											<Input
												type="number"
												placeholder="170"
												className="text-center text-lg"
												min="120"
												max="220"
												value={data.appearance.heightCm}
												onChange={(e) => update("appearance", { heightCm: e.target.value })}
											/>
										</div>
									</div>
								)}

								<div className="text-center">
									<button
										type="button"
										onClick={() => {
											// Allow users to skip height or mark as not accurate
											update("appearance", { heightCm: "not-accurate" });
										}}
										className={`text-sm transition-all ${
											data.appearance.heightCm === "not-accurate"
												? "text-purple-600 font-medium"
												: "text-neutral-500 hover:text-neutral-700"
										}`}
									>
										Not Accurate
									</button>
								</div>
							</div>
						</div>
					)}

					<div className="mt-8 flex items-center justify-between border-t pt-6">
						{currentStepIndex === 0 ? (
							<Link href="/">
								<Button variant="ghost" className="text-neutral-600">
									← Cancel
								</Button>
							</Link>
						) : (
							<Button variant="secondary" onClick={back} className="flex items-center gap-2">
								← Back
							</Button>
						)}
						{currentStepIndex < steps.length - 1 ? (
							<Button 
								onClick={next} 
								disabled={!completed[currentKey]}
								className="flex items-center gap-2 min-w-[120px]"
							>
								Continue →
							</Button>
						) : (
							<Button
								onClick={async () => {
									// Save all form data to sessionStorage
									const formDataToSave = {
										gender: data.basic.gender,
										age_group: data.basic.ageGroup,
										occupation: data.basic.occupation,
										height: data.appearance.heightCm,
										body_type: data.appearance.bodyType,
										color_analysis: {
											skin: data.skinTone.skinColor,
											hair: data.skinTone.hairColor,
											eye: data.skinTone.eyeColor,
											undertone: data.skinTone.colorAnalysis?.undertone || 'neutral',
											skin_tone: data.skinTone.colorAnalysis?.skinTone || 'medium',
											score: data.skinTone.colorAnalysis?.score || 0,
											manual_override: data.skinTone.colorAnalysis?.manualOverride || false,
											calibrated_colors: data.skinTone.colorAnalysis?.calibratedColors || {
												skin: data.skinTone.skinColor,
												hair: data.skinTone.hairColor,
												eye: data.skinTone.eyeColor,
											},
										},
									};
									
									sessionStorage.setItem('styleQuizData', JSON.stringify(formDataToSave));
									
									// Redirect to quick-style page
									window.location.href = '/quick-style';
								}}
								disabled={!completed.basic || !completed.skinTone || !completed.appearance}
								className="flex items-center gap-2 min-w-[180px]"
								size="lg"
							>
								Continue to Quick Style →
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
		</div>
	);
};

export default StyleQuizPage;
