"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/ui/like-button";

const HeroDesktop = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	
	return (
		<div className="min-h-screen bg-background flex flex-col items-center">
			{/* Top Nav */}
			<header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
				<div className="flex items-center gap-2 sm:gap-3">
					<Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
						<span className="text-xl sm:text-2xl font-extrabold tracking-tight">CAF</span>
						<span className="text-xs sm:text-sm text-muted-foreground">AI Stylist</span>
					</Link>
				</div>
				<nav className="hidden items-center gap-8 md:flex">
					<Link
						href="#why-caf"
						className="text-sm text-foreground hover:opacity-80 transition-opacity"
					>
						Why CAF
					</Link>
					<Link
						href="/style-quiz"
						className="text-sm text-foreground hover:opacity-80 transition-opacity"
					>
						StyleIt
					</Link>
					<Link
						href="#features"
						className="text-sm text-foreground hover:opacity-80 transition-opacity"
					>
						Features
					</Link>
					<Link
						href="/dashboard"
						className="text-sm text-foreground hover:opacity-80 transition-opacity"
					>
						Brand Portal
					</Link>
				</nav>
				<div className="hidden md:flex items-center gap-3">
					<Button
						variant="ghost"
						className="px-4 hover:scale-105 transition-transform"
					>
						Login
					</Button>
					<Button asChild className="px-5 hover:scale-105 transition-transform">
						<Link href="/style-quiz">Try CAF Now</Link>
					</Button>
				</div>
				{/* Mobile menu button */}
				<button 
					className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle menu"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{mobileMenuOpen ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
			</header>
			
			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-white border-b shadow-lg animate-in slide-in-from-top duration-200">
					<nav className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-col gap-3">
						<Link
							href="#why-caf"
							className="text-sm text-foreground hover:text-secondary transition-colors py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							Why CAF
						</Link>
						<Link
							href="/style-quiz"
							className="text-sm text-foreground hover:text-secondary transition-colors py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							StyleIt
						</Link>
						<Link
							href="#features"
							className="text-sm text-foreground hover:text-secondary transition-colors py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							Features
						</Link>
						<Link
							href="/dashboard"
							className="text-sm text-foreground hover:text-secondary transition-colors py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							Brand Portal
						</Link>
						<div className="flex flex-col gap-2 pt-4 border-t">
							<Button variant="ghost" className="w-full">
								Login
							</Button>
							<Button asChild className="w-full">
								<Link href="/style-quiz">Try CAF Now</Link>
							</Button>
						</div>
					</nav>
				</div>
			)}

			{/* Hero */}
			<div className="relative w-[80%] overflow-hidden rounded-b-[24px] sm:rounded-b-[32px] md:rounded-b-[56px]">
				{/* bottom-left soft gradient background */}
				<div className="pointer-events-none absolute inset-0 bg-hero-blob" />
				<section className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 sm:gap-8 px-4 sm:px-6 pb-12 sm:pb-16 pt-6 sm:pt-8 md:grid-cols-2 md:gap-6 md:pb-24 md:pt-10">
					{/* Left copy */}
					<div className="relative z-10 space-y-4 sm:space-y-6 text-center md:text-left">
						<h1 className="text-balance text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl px-2 sm:px-0">
							Get AI-Picked Outfits
							<br className="hidden sm:block" />
							<span className="sm:hidden"> </span>
							Tailored <span className="text-secondary">To You</span>
						</h1>
						<p className="max-w-xl mx-auto md:mx-0 text-sm sm:text-base text-muted-foreground md:text-lg px-2 sm:px-0">
							Discover AI-personalized outfit recommendations tailored to your body type, budget, and the event you&apos;re dressing for.
						</p>
					<div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center md:justify-start px-2 sm:px-0">
						<Button asChild className="rounded-full px-6 py-4 sm:py-5 text-sm w-full sm:w-auto hover:scale-105 transition-transform active:scale-95">
							<Link href="/style-quiz">Start Style Quiz</Link>
						</Button>
						<Button
							variant="outline"
							className="rounded-full px-6 py-4 sm:py-5 text-sm w-full sm:w-auto hover:scale-105 transition-transform active:scale-95"
							asChild
						>
							<Link href="/style-quiz">Upload Item</Link>
						</Button>
					</div>
					</div>

					{/* Right phone mock (cropped at page edge) */}
					<div className="relative flex h-[300px] sm:h-[420px] items-center justify-center md:justify-end md:h-[600px] bg-gray-100 rounded-xl">
						{/* soft gradient blob */}
						<div
							className="pointer-events-none absolute left-[50%] sm:left-[60%] top-1/2 z-0 h-[400px] w-[400px] sm:h-[640px] sm:w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-[48px] blur-0 md:h-[820px] md:w-[820px] lg:h-[1100px] lg:w-[1100px]"
							style={{
								background:
									"radial-gradient(50% 50% at 60% 50%, color-mix(in oklch, var(--color-secondary) 48%, transparent) 0%, transparent 72%), " +
									"radial-gradient(48% 48% at 36% 64%, color-mix(in oklch, var(--color-accent) 32%, transparent) 0%, transparent 62%)",
							}}
						/>
						<Image
							src="/assets/Hero.png"
							alt="Phone showing outfits"
							priority
							className="relative z-10 h-auto w-[220px] sm:w-[280px] md:w-[320px] md:translate-x-6 lg:w-[1450px] lg:translate-y- lg:translate-x-44 rounded-xl"
							width={1080}
							height={1920}
						/>
					</div>
				</section>
			</div>
		</div>
	);
};

const Page = () => {
	return (
		<div>
			<HeroDesktop />
		{/* How CAF Works */}
		<section id="features" className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
				<div className="text-center">
					<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">How CAF Works</h2>
					<p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">Get styled in 3 simple steps</p>
				</div>
				<div className="mt-8 sm:mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
					{/* Card 1 */}
					<div className="rounded-xl sm:rounded-2xl border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
						<div className="mx-auto mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-[radial-gradient(100%_100%_at_50%_0%,theme(colors.secondary)/25%,transparent_70%)]">
							<Image
								src="/assets/icons/1.png"
								alt="Quiz icon"
								width={48}
								height={48}
								className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
							/>
						</div>
							<h3 className="text-lg sm:text-xl font-semibold">Answer Style Quiz</h3>
							<p className="mt-2 text-sm text-muted-foreground">Share your body type, skin tone, budget &amp; occasion preferences</p>
							<Button asChild variant="link" className="mt-2 text-purple-600 p-0 h-auto text-sm sm:text-base">
								<Link href="/style-quiz">Take Quiz →</Link>
							</Button>
					</div>
					{/* Card 2 */}
					<div className="rounded-xl sm:rounded-2xl border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
						<div className="mx-auto mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-[radial-gradient(100%_100%_at_50%_0%,theme(colors.secondary)/25%,transparent_70%)]">
							<Image
								src="/assets/icons/2.png"
								alt="Magic icon"
								width={48}
								height={48}
								className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
							/>
						</div>
						<h3 className="text-lg sm:text-xl font-semibold">Let AI Do the Magic</h3>
						<p className="mt-2 text-sm text-muted-foreground">Our AI analyzes your preferences and finds perfect matches</p>
					</div>
					{/* Card 3 */}
					<div className="rounded-xl sm:rounded-2xl border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
						<div className="mx-auto mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-[radial-gradient(100%_100%_at_50%_0%,theme(colors.secondary)/25%,transparent_70%)]">
							<Image
								src="/assets/icons/3.png"
								alt="Outfits icon"
								width={48}
								height={48}
								className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
							/>
						</div>
						<h3 className="text-lg sm:text-xl font-semibold">Get Your Outfits</h3>
						<p className="mt-2 text-sm text-muted-foreground">Receive personalized outfit suggestions with shopping links</p>
					</div>
				</div>
			</section>

		{/* Visualize Before You Buy */}
		<section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
			<div className="text-center">
				<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Visualize Before You Buy</h2>
				<p className="mt-2 sm:mt-3 text-sm text-muted-foreground md:text-base px-2">
					Explore how each outfit fits you virtually. Our AR Try-On feature lets you preview how clothes look on your body in real time.
				</p>
			</div>

			{/* Stage */}
			<div className="relative mx-auto mt-8 sm:mt-12 grid w-full place-items-center">
				{/* Surrounding product cards (placeholders) */}
				<div className="absolute -left-6 top-12 hidden rotate-[-12deg] lg:block">
						<div className="relative h-48 w-40 overflow-hidden rounded-2xl border bg-card p-0 shadow-md">
							<LikeButton aria-label="Like shirt" />
							<Image
								src="/assets/ui/shirt.png"
								alt="Shirt"
								width={160}
								height={192}
								className="h-full w-full object-cover"
							/>
						</div>
					</div>
					<div className="absolute left-0 bottom-8 hidden rotate-[-8deg] lg:block">
						<div className="relative h-48 w-40 overflow-hidden rounded-2xl border bg-card p-0 shadow-md">
							<LikeButton aria-label="Like pants" />
							<Image
								src="/assets/ui/pant.png"
								alt="Pants"
								width={160}
								height={192}
								className="h-full w-full object-cover"
							/>
						</div>
					</div>
					<div className="absolute -right-6 top-10 hidden rotate-[12deg] lg:block">
						<div className="relative h-48 w-40 overflow-hidden rounded-2xl border bg-card p-0 shadow-md">
							<LikeButton aria-label="Like shoes" />
							<Image
								src="/assets/ui/shoes.png"
								alt="Shoes"
								width={160}
								height={192}
								className="h-full w-full object-cover"
							/>
						</div>
					</div>
					<div className="absolute right-0 bottom-6 hidden rotate-[8deg] lg:block">
						<div className="relative h-48 w-40 overflow-hidden rounded-2xl border bg-card p-0 shadow-md">
							<LikeButton aria-label="Like watch" />
							<Image
								src="/assets/ui/watch.png"
								alt="Watch"
								width={160}
								height={192}
								className="h-full w-full object-cover"
							/>
						</div>
					</div>

				{/* Central try-on frame */}
				<div className="relative w-full max-w-[520px] rounded-2xl sm:rounded-[28px] border bg-card p-3 sm:p-4 shadow-lg ring-1 ring-secondary/30">
					<div className="mb-2 sm:mb-3 flex items-center justify-between">
						<button 
							className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border text-sm transition-all hover:bg-muted hover:scale-105 active:scale-95"
							aria-label="Minimize"
							title="Minimize"
						>
							−
						</button>
						<span className="text-xs sm:text-sm font-medium">Try-On Room</span>
						<button 
							className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border text-sm transition-all hover:bg-muted hover:scale-105 active:scale-95"
							aria-label="Add to cart"
							title="Add to cart"
						>
							🛒
						</button>
					</div>
					<div className="aspect-[4/5] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-muted/40">
						<Image
							src="/assets/ui/guy.png"
							alt="Model"
							width={520}
							height={650}
							className="h-full w-full object-cover"
						/>
					</div>
					{/* Category pills */}
					<div className="mx-auto mt-3 sm:mt-4 flex w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2">
						{["All", "Shirts", "T-Shirts", "Jackets", "Trousers"].map((label) => (
							<button
								key={label}
								className="rounded-full border px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs text-foreground/80 transition-all hover:bg-secondary hover:text-secondary-foreground hover:border-secondary active:scale-95"
							>
								{label}
							</button>
						))}
					</div>
				</div>
				</div>

			{/* CTA area */}
			<div className="mt-6 sm:mt-10 text-center px-4">
				<p className="text-xs sm:text-sm text-muted-foreground">Upload or Select Your Outfit</p>
				<div className="mx-auto mt-2 sm:mt-3 flex w-max items-center gap-2">
					<span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
					<span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
					<span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
					<span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
				</div>
				<div className="mt-4 sm:mt-6">
					<Button asChild className="rounded-full px-6 py-4 sm:py-5 text-sm w-full sm:w-auto">
						<Link href="/style-quiz">Try Outfit in AR</Link>
					</Button>
				</div>
			</div>
			</section>

		{/* Why CAF Section */}
		<section id="why-caf" className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
			<div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-6 sm:p-8 md:p-12 lg:p-16">
					{/* Background gradient effects */}
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10" />
					<div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

				<div className="relative grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16">
					{/* Left content */}
					<div className="flex flex-col justify-center text-center lg:text-left">
						<h2 className="text-2xl sm:text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
							Why CAF?
						</h2>
						<p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-300 md:text-xl">
							CAF&apos;s smart algorithm learns your preferences through a detailed style quiz, delivering personalized outfit suggestions tailored to your body, taste, and occasion.
						</p>
						<div className="mt-6 sm:mt-8">
							<Button asChild className="rounded-full bg-white px-6 sm:px-8 py-4 sm:py-6 text-slate-900 hover:bg-slate-100 w-full sm:w-auto">
								<Link href="/style-quiz">Start Style Quiz</Link>
							</Button>
						</div>
					</div>

					{/* Right grid of feature cards */}
					<div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
						{/* AI-Powered Styling */}
						<div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 hover:bg-white/15 transition-colors">
							<div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-purple-500/20">
								<svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-white">AI-Powered Styling</h3>
							<p className="mt-2 text-xs sm:text-sm text-slate-300">
								Uses AI to learn your style, body type, and occasions.
							</p>
							<Link href="/style-quiz" className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-purple-300 hover:text-purple-200 transition-colors">
								Take the Style Quiz
								<svg className="ml-1 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
						</div>

						{/* Inclusive for Body */}
						<div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 hover:bg-white/15 transition-colors">
							<div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-pink-500/20">
								<svg className="h-5 w-5 sm:h-6 sm:w-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
								</svg>
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-white">Inclusive for Body</h3>
							<p className="mt-2 text-xs sm:text-sm text-slate-300">
								Celebrates all shapes, sizes, and tones with flattering looks.
							</p>
							<Link href="/style-quiz" className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-pink-300 hover:text-pink-200 transition-colors">
								See How It Works
								<svg className="ml-1 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
						</div>

						{/* Occasion-Outfits */}
						<div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 hover:bg-white/15 transition-colors">
							<div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500/20">
								<svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-white">Occasion-Outfits</h3>
							<p className="mt-2 text-xs sm:text-sm text-slate-300">
								Helps you dress with purpose for any event or day.
							</p>
							<Link href="/style-quiz" className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-blue-300 hover:text-blue-200 transition-colors">
								Shop by Occasion
								<svg className="ml-1 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
						</div>

						{/* Fits Your Budget */}
						<div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 hover:bg-white/15 transition-colors">
							<div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-green-500/20">
								<svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
								</svg>
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-white">Fits Your Budget</h3>
							<p className="mt-2 text-xs sm:text-sm text-slate-300">
								Filters outfits by budget so you look great affordably.
							</p>
							<Link href="/style-quiz" className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-green-300 hover:text-green-200 transition-colors">
								Set Your Budget Preferences
								<svg className="ml-1 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
						</div>
						</div>
					</div>
				</div>
			</section>

		</div>
	);
};

export default Page;
