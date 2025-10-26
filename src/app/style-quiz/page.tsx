"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import gsap from "gsap";

type BasicProfile = {
	gender: string;
	ageGroup: string;
	occupation: string;
};

type Appearance = {
	heightCm: string;
	bodyType: string;
	heightUnit: 'inch' | 'cm';
};

type StylePrefs = {
	favoriteColors: string;
	preferredFit: string;
	referenceImage: File | null;
	referenceDescription: string;
};

type FormData = {
	basic: BasicProfile;
	appearance: Appearance;
	style: StylePrefs;
};

const initialData: FormData = {
	basic: { gender: "female", ageGroup: "", occupation: "" },
	appearance: { heightCm: "", bodyType: "", heightUnit: "inch" },
	style: { favoriteColors: "", preferredFit: "", referenceImage: null, referenceDescription: "" },
};

const steps = [
	{ key: "basic", label: "Tell Us about Yourself" },
	{ key: "appearance", label: "Your Appearance" },
	{ key: "style", label: "Style Preferences" },
] as const;

const ageGroups = ["<18", "18 - 25", "26 - 35", "36 - 45", "45+"];
const occupations = ["College Student", "Working Professional", "School Student", "Parent", "Other"];

type StepKey = (typeof steps)[number]["key"];

function isBasicDone(basic: BasicProfile) {
	return basic.gender.trim().length > 0 && basic.ageGroup.trim().length > 0 && basic.occupation.trim().length > 0;
}

function isAppearanceDone(appearance: Appearance) {
	const hasHeight = appearance.heightUnit === 'inch'
		? (appearance.heightCm.includes("'") && appearance.heightCm.includes('"')) || appearance.heightCm === "not-accurate"
		: appearance.heightCm.trim().length > 0 || appearance.heightCm === "not-accurate";
	return hasHeight && appearance.bodyType.trim().length > 0;
}

function isStyleDone(style: StylePrefs) {
	return style.favoriteColors.trim().length > 0 && style.preferredFit.trim().length > 0;
}

const StyleQuizPage = () => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [data, setData] = useState<FormData>(initialData);
	const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
	const [showSavedDataNotice, setShowSavedDataNotice] = useState(false);
	const stepRefs = useRef<HTMLDivElement[]>([]);

	const completed: Record<StepKey, boolean> = useMemo(
		() => ({
			basic: isBasicDone(data.basic),
			appearance: isAppearanceDone(data.appearance),
			style: isStyleDone(data.style),
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

	// Load data from localStorage on mount
	useEffect(() => {
		if (typeof window !== 'undefined' && !hasLoadedFromStorage) {
			const savedData = localStorage.getItem('styleQuizFormData');
			if (savedData) {
				try {
					const parsed = JSON.parse(savedData);
					// Don't load referenceImage from localStorage (too large)
					// Keep it null and let user upload fresh
					setData({
						...parsed,
						style: {
							...parsed.style,
							referenceImage: null,
						}
					});
					setHasLoadedFromStorage(true);
					setShowSavedDataNotice(true);
					// Hide notice after 5 seconds
					setTimeout(() => setShowSavedDataNotice(false), 5000);
				} catch (e) {
					console.error('Error loading saved form data:', e);
				}
			}
			setHasLoadedFromStorage(true);
		}
	}, [hasLoadedFromStorage]);

	// Save data to localStorage whenever it changes (except referenceImage)
	useEffect(() => {
		if (typeof window !== 'undefined' && hasLoadedFromStorage) {
			// Create a copy without the File object (can't be stringified)
			const dataToSave = {
				basic: data.basic,
				appearance: data.appearance,
				style: {
					favoriteColors: data.style.favoriteColors,
					preferredFit: data.style.preferredFit,
					referenceDescription: data.style.referenceDescription,
					// Don't save referenceImage File object
					referenceImage: null,
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

	return (
		<div className="w-full px-4 py-10">
			{/* Saved Data Notice */}
			{showSavedDataNotice && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					className="mx-auto max-w-6xl mb-4"
				>
					<div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
						<span className="text-2xl">✓</span>
						<div className="flex-1">
							<p className="text-sm font-medium text-green-800">
								Your saved data has been loaded!
							</p>
							<p className="text-xs text-green-600">
								We've restored your previous answers. You can continue where you left off.
							</p>
						</div>
					</div>
				</motion.div>
			)}
			
			<div className="mx-auto max-w-6xl mb-8 flex items-center justify-between">
				{steps.map((s, i) => {
					const connectorProgress = i === 0 ? (currentStepIndex > 0 ? 100 : completed.basic ? 100 : 0) : i === 1 ? (currentStepIndex > 1 ? 100 : completed.appearance ? 100 : 0) : 0;
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
					<div className="flex items-center justify-between">
						<div className="flex-1"></div>
						<CardTitle className="flex-1 text-center text-2xl">
							{currentKey === "basic" && "Tell Us about Yourself"}
							{currentKey === "appearance" && "Tell us about your appearance"}
							{currentKey === "style" && "Share your style preferences"}
						</CardTitle>
						<div className="flex-1 flex justify-end">
							<Button
								variant="outline"
								size="sm"
								onClick={resetFormData}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
								title="Clear all saved data and start fresh"
							>
								🔄 Reset Form
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="min-h-[700px] space-y-20 py-12">
					{currentKey === "basic" && (
						<>
							{/* Gender Selection */}
							<div className="space-y-8">
								<label className="block text-center text-base text-neutral-700">
									What's your gender? <span className="text-red-500">*</span>
								</label>
								<div className="flex justify-center gap-16">
									<button
										type="button"
										onClick={() => update("basic", { gender: "male" })}
										className="group flex flex-col items-center gap-3"
									>
										<div
											className={`relative h-40 w-40 overflow-hidden rounded-full transition-all ${data.basic.gender === "male"
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
											<span className="text-sm text-neutral-700">Male</span>
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
										className="group flex flex-col items-center gap-3"
									>
										<div
											className={`relative h-40 w-40 overflow-hidden rounded-full transition-all ${data.basic.gender === "female"
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
											<span className="text-sm text-neutral-700">Female</span>
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
								<label className="block text-center text-sm text-neutral-600">
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
								<label className="block text-center text-sm text-neutral-600">
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

					{currentKey === "appearance" && (
						<div className="space-y-16">
							{/* Body Type Selection */}
							<div className="space-y-8">
								<label className="block text-center text-lg font-medium text-neutral-700">
									What best describes your body type? <span className="text-red-500">*</span>
								</label>
								<div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
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
											className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all hover:border-purple-300 ${
												data.appearance.bodyType === bodyType.key
													? "border-purple-500 bg-gradient-to-b from-purple-50 to-pink-50 ring-2 ring-purple-200"
													: "border-neutral-200 bg-white hover:bg-neutral-50"
											}`}
										>
											<div className="relative h-96 w-40">
												<Image
													src={bodyType.image}
													alt={bodyType.label}
													fill
													className="object-contain"
													sizes="96px"
												/>
											</div>
											<span className={`text-sm font-medium ${
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
											<label className="mb-2 block text-sm text-neutral-600 text-center">Enter In Feet</label>
											<Input
												type="number"
												placeholder="FT"
												className="text-center"
												value={data.appearance.heightCm.split("'")[0] || ""}
												onChange={(e) => {
													const feet = e.target.value;
													const inches = data.appearance.heightCm.split("'")[1]?.replace('"', '') || '';
													update("appearance", { heightCm: `${feet}'${inches}"` });
												}}
											/>
										</div>
										<div className="flex-1">
											<label className="mb-2 block text-sm text-neutral-600 text-center">Enter in Inch</label>
											<Input
												type="number"
												placeholder="Inch"
												className="text-center"
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
											<Input
												type="number"
												placeholder="Enter height in CM"
												className="text-center"
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

					{currentKey === "style" && (
						<div className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-1 block text-sm text-neutral-600">Favorite Colors</label>
									<Input
										placeholder="e.g. Navy, Olive"
										value={data.style.favoriteColors}
										onChange={(e) => update("style", { favoriteColors: e.target.value })}
									/>
								</div>
								<div>
									<label className="mb-1 block text-sm text-neutral-600">Preferred Fit</label>
									<Input
										placeholder="e.g. Regular / Slim"
										value={data.style.preferredFit}
										onChange={(e) => update("style", { preferredFit: e.target.value })}
									/>
								</div>
							</div>
							
							{/* Reference Image Upload */}
							<div className="border-t pt-4">
								<label className="mb-2 block text-sm font-medium text-neutral-700">
									Have a clothing item you want to build outfits around? (Optional)
								</label>
								<p className="mb-3 text-xs text-neutral-500">
									Upload an image of a clothing item, and we'll create outfits that complement it perfectly.
								</p>
								<div className="space-y-3">
									<Input
										type="file"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files?.[0] || null;
											update("style", { referenceImage: file });
										}}
										className="cursor-pointer"
									/>
									{data.style.referenceImage && (
										<div className="flex items-start gap-3 rounded-lg border bg-neutral-50 p-3">
											<div className="flex-1">
												<p className="text-sm font-medium text-neutral-700">
													{data.style.referenceImage.name}
												</p>
												<p className="text-xs text-neutral-500">
													{(data.style.referenceImage.size / 1024).toFixed(1)} KB
												</p>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => update("style", { referenceImage: null, referenceDescription: "" })}
												className="text-red-600 hover:text-red-700"
											>
												Remove
											</Button>
										</div>
									)}
									{data.style.referenceImage && (
										<div>
											<label className="mb-1 block text-xs text-neutral-600">
												Describe this item (optional - helps AI understand better)
											</label>
											<Input
												placeholder="e.g. Blue denim jacket, floral summer dress"
												value={data.style.referenceDescription}
												onChange={(e) => update("style", { referenceDescription: e.target.value })}
											/>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					<div className="mt-8 flex items-center justify-between">
						{currentStepIndex === 0 ? (
							<Button variant="ghost" className="text-neutral-600">
								Skip
							</Button>
						) : (
							<Button variant="secondary" onClick={back}>
								Back
							</Button>
						)}
						{currentStepIndex < steps.length - 1 ? (
							<Button onClick={next} disabled={!completed[currentKey]}>
								Continue
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
										preferred_fit: data.style.preferredFit,
										colors: data.style.favoriteColors,
										reference_description: data.style.referenceDescription,
									};
									
									sessionStorage.setItem('styleQuizData', JSON.stringify(formDataToSave));
									
									// Convert reference image to base64 if it exists
									if (data.style.referenceImage) {
										const reader = new FileReader();
										reader.onloadend = () => {
											const base64 = reader.result as string;
											// Remove the data:image/...;base64, prefix
											const base64Data = base64.split(',')[1];
											sessionStorage.setItem('referenceImageBase64', base64Data);
											window.location.href = `/suggestions?bodyType=${data.appearance.bodyType}`;
										};
										reader.readAsDataURL(data.style.referenceImage);
									} else {
										sessionStorage.removeItem('referenceImageBase64');
										window.location.href = `/suggestions?bodyType=${data.appearance.bodyType}`;
									}
								}}
								disabled={!completed.basic || !completed.appearance || !completed.style}
							>
								Get My Suggestions
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default StyleQuizPage;
