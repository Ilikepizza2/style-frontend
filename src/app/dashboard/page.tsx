"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
	TrendingUp, TrendingDown, Users, ShoppingCart, 
	RotateCcw, DollarSign, MapPin, Calendar,
	Filter, Download, Bell, ChevronDown,
	Sparkles, AlertCircle, Eye, Heart, Package,
	Target, Zap, Shield, BarChart3, Activity
} from "lucide-react";
import {
	BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
	XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
	AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
	ScatterChart, Scatter, ComposedChart
} from "recharts";

// Mock data for visualizations
const kpiData = {
	activeUsers: { value: "47.2K", change: 12.5, period: "7d" },
	conversionRate: { value: "3.8%", change: -2.1, period: "7d" },
	avgOrderValue: { value: "₹4,250", change: 8.3, period: "7d" },
	returnRate: { value: "5.2%", change: -15.4, period: "7d" },
	ltv: { value: "₹18.5K", change: 6.8, period: "90d" },
	nps: { value: "72", change: 4.2, period: "30d" }
};

const topTrends = [
	{ title: "Elevated Loungewear", strength: 94, growth: "+45%", region: "Mumbai" },
	{ title: "Earth Tone Palettes", strength: 87, growth: "+32%", region: "Delhi" },
	{ title: "Oversized Silhouettes", strength: 76, growth: "+28%", region: "Bangalore" }
];

const occasionData = [
	{ name: "Casual", value: 3245, conversion: 4.2, avgOrder: 3200, color: "#3b82f6" },
	{ name: "Formal", value: 2156, conversion: 5.8, avgOrder: 5500, color: "#8b5cf6" },
	{ name: "Party", value: 1876, conversion: 3.9, avgOrder: 6200, color: "#ec4899" },
	{ name: "Wedding", value: 1543, conversion: 6.5, avgOrder: 8500, color: "#f59e0b" },
	{ name: "Casual Work", value: 2987, conversion: 4.5, avgOrder: 3800, color: "#10b981" }
];

const regionalData = [
	{ region: "Mumbai", users: 12500, revenue: 5250000, conversion: 4.2 },
	{ region: "Delhi", users: 10800, revenue: 4680000, conversion: 3.9 },
	{ region: "Bangalore", users: 9200, revenue: 4140000, conversion: 4.1 },
	{ region: "Hyderabad", users: 6500, revenue: 2600000, conversion: 3.7 },
	{ region: "Chennai", users: 5400, revenue: 2160000, conversion: 3.5 },
	{ region: "Pune", users: 4200, revenue: 1680000, conversion: 3.8 }
];

const bodyTypeData = [
	{ type: "Hourglass", count: 8500, returnRate: 4.2, satisfaction: 92, color: "#ec4899" },
	{ type: "Pear", count: 7200, returnRate: 5.8, satisfaction: 85, color: "#8b5cf6" },
	{ type: "Apple", count: 6800, returnRate: 6.2, satisfaction: 82, color: "#f59e0b" },
	{ type: "Rectangle", count: 6200, returnRate: 4.9, satisfaction: 88, color: "#3b82f6" },
	{ type: "Inverted", count: 5100, returnRate: 5.1, satisfaction: 87, color: "#10b981" }
];

const skinToneData = [
	{ tone: "Very Light", count: 4200, affinity: "Pastels, Cool tones", color: "#fde4cf", engagement: 78 },
	{ tone: "Light", count: 7800, affinity: "Earth tones, Warm", color: "#f7d6b5", engagement: 82 },
	{ tone: "Medium", count: 12500, affinity: "Jewel tones, Rich", color: "#d4a574", engagement: 85 },
	{ tone: "Tan", count: 8900, affinity: "Bold, Vibrant", color: "#a67651", engagement: 88 },
	{ tone: "Deep", count: 6200, affinity: "Metallics, Bright", color: "#6b4423", engagement: 86 }
];

const trendTimelineData = [
	{ month: "Jan", casual: 2400, formal: 1800, party: 1200, workout: 800 },
	{ month: "Feb", casual: 2200, formal: 2100, party: 1400, workout: 900 },
	{ month: "Mar", casual: 2800, formal: 1900, party: 1800, workout: 1100 },
	{ month: "Apr", casual: 3200, formal: 1700, party: 2200, workout: 1400 },
	{ month: "May", casual: 3600, formal: 1600, party: 2600, workout: 1600 },
	{ month: "Jun", casual: 4100, formal: 2000, party: 2800, workout: 1900 }
];

const ageGenderData = [
	{ age: "18-24", male: 3200, female: 4800, total: 8000 },
	{ age: "25-34", male: 5400, female: 7200, total: 12600 },
	{ age: "35-44", male: 4100, female: 5800, total: 9900 },
	{ age: "45-54", male: 2800, female: 3600, total: 6400 },
	{ age: "55+", male: 1400, female: 2200, total: 3600 }
];

const performanceRadarData = [
	{ metric: "Engagement", value: 82, fullMark: 100 },
	{ metric: "Conversion", value: 68, fullMark: 100 },
	{ metric: "Retention", value: 75, fullMark: 100 },
	{ metric: "Satisfaction", value: 88, fullMark: 100 },
	{ metric: "Personalization", value: 72, fullMark: 100 },
	{ metric: "Diversity", value: 65, fullMark: 100 }
];

const inventoryData = [
	{ sku: "SKU-1023", name: "Cotton T-Shirt M", stock: 45, predicted: 180, risk: "high", action: "Restock 150 units" },
	{ sku: "SKU-2045", name: "Denim Jacket L", stock: 120, predicted: 95, risk: "low", action: "Adequate" },
	{ sku: "SKU-3067", name: "Formal Shirt S", stock: 78, predicted: 140, risk: "medium", action: "Restock 70 units" },
	{ sku: "SKU-4089", name: "Casual Dress M", stock: 32, predicted: 110, risk: "high", action: "Urgent restock" },
	{ sku: "SKU-5012", name: "Workout Leggings", stock: 156, predicted: 90, risk: "low", action: "Consider markdown" }
];

const productPerformanceData = [
	{ category: "T-Shirts", views: 45000, tries: 12000, purchases: 3200, returnRate: 4.2 },
	{ category: "Dresses", views: 38000, tries: 10500, purchases: 2800, returnRate: 6.8 },
	{ category: "Jeans", views: 42000, tries: 11200, purchases: 3500, returnRate: 8.1 },
	{ category: "Formal", views: 28000, tries: 7800, purchases: 2200, returnRate: 5.5 },
	{ category: "Activewear", views: 35000, tries: 9500, purchases: 2900, returnRate: 3.9 }
];

const demandForecastData = [
	{ week: "W1", predicted: 2400, actual: 2300, confidence: 85 },
	{ week: "W2", predicted: 2600, actual: 2550, confidence: 87 },
	{ week: "W3", predicted: 2800, actual: 2750, confidence: 86 },
	{ week: "W4", predicted: 3200, actual: null, confidence: 82 },
	{ week: "W5", predicted: 3400, actual: null, confidence: 80 },
	{ week: "W6", predicted: 3600, actual: null, confidence: 78 }
];

type TabType = "overview" | "audience" | "products" | "trends" | "operations";

export default function BrandDashboard() {
	const [activeTab, setActiveTab] = useState<TabType>("overview");
	const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
	const [dateRange, setDateRange] = useState("7d");

	const renderOverview = () => (
		<>
			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
				{Object.entries(kpiData).map(([key, data], idx) => {
					const isPositive = data.change > 0;
					const icons = {
						activeUsers: Users,
						conversionRate: ShoppingCart,
						avgOrderValue: DollarSign,
						returnRate: RotateCcw,
						ltv: Sparkles,
						nps: Heart
					};
					const Icon = icons[key as keyof typeof icons];
					const labels = {
						activeUsers: "Active Users",
						conversionRate: "Conversion Rate",
						avgOrderValue: "Avg Order Value",
						returnRate: "Return Rate",
						ltv: "Lifetime Value",
						nps: "NPS Score"
					};

					return (
						<Card key={key} className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
							<CardContent className="p-4">
								<div className="flex items-start justify-between mb-3">
									<div className="p-2 rounded-lg bg-purple-100">
										<Icon className="w-4 h-4 text-purple-600" />
									</div>
									<Badge 
										variant={isPositive ? "default" : "secondary"}
										className={`gap-1 ${isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
									>
										{isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
										{Math.abs(data.change)}%
									</Badge>
								</div>
								<div>
									<p className="text-xs text-neutral-500 mb-1">{labels[key as keyof typeof labels]}</p>
									<p className="text-2xl font-bold text-neutral-900">{data.value}</p>
									<p className="text-xs text-neutral-400 mt-1">vs last {data.period}</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* AI Insights & Trends */}
			<Card className="mb-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white overflow-hidden">
				<CardContent className="p-6">
					<div className="flex items-start gap-4">
						<div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
							<Sparkles className="w-6 h-6" />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-bold mb-3">🔥 Top Micro-Trends This Week</h3>
							<div className="grid md:grid-cols-3 gap-4">
								{topTrends.map((trend, idx) => (
									<div key={idx} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
										<div className="flex items-start justify-between mb-2">
											<Badge className="bg-white/20 text-white border-white/30">
												#{idx + 1}
											</Badge>
											<span className="text-sm font-bold text-green-300">{trend.growth}</span>
										</div>
										<h4 className="font-bold mb-1">{trend.title}</h4>
										<p className="text-xs text-white/80 mb-2">
											<MapPin className="w-3 h-3 inline mr-1" />
											{trend.region}
										</p>
										<div className="w-full bg-white/20 rounded-full h-2">
											<div 
												className="bg-white rounded-full h-2 transition-all"
												style={{ width: `${trend.strength}%` }}
											/>
										</div>
										<p className="text-xs text-white/70 mt-1">Trend Strength: {trend.strength}/100</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Dashboard Grid */}
			<div className="grid lg:grid-cols-3 gap-6 mb-8">
				{/* Occasion Demand */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="w-5 h-5 text-purple-600" />
							Occasion Demand & Conversion
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={occasionData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis dataKey="name" tick={{ fontSize: 12 }} />
								<YAxis yAxisId="left" tick={{ fontSize: 12 }} />
								<YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
								<Tooltip 
									contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
								/>
								<Legend />
								<Bar yAxisId="left" dataKey="value" fill="#8b5cf6" name="Saves" radius={[8, 8, 0, 0]} />
								<Bar yAxisId="right" dataKey="conversion" fill="#10b981" name="Conversion %" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Occasion Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Occasion Split</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={occasionData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{occasionData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Regional Performance */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="w-5 h-5 text-purple-600" />
						Regional Performance Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
						{regionalData.map((region, idx) => (
							<div 
								key={idx}
								className="p-4 rounded-lg border-2 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
								onClick={() => setSelectedRegion(region.region)}
							>
								<div className="flex items-center justify-between mb-2">
									<div>
										<h4 className="font-semibold text-neutral-900">{region.region}</h4>
										<p className="text-xs text-neutral-500">{region.users.toLocaleString()} active users</p>
									</div>
									<Badge className="bg-green-100 text-green-700">
										{region.conversion}% CVR
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-neutral-600">Revenue</span>
									<span className="font-bold text-purple-600">
										₹{(region.revenue / 100000).toFixed(1)}L
									</span>
								</div>
								<div className="w-full bg-neutral-100 rounded-full h-2 mt-2">
									<div 
										className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-2 transition-all"
										style={{ width: `${(region.revenue / 5250000) * 100}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);

	const renderAudience = () => (
		<>
			{/* Audience Overview Cards */}
			<div className="grid md:grid-cols-4 gap-4 mb-8">
				<Card className="border-l-4 border-l-blue-500">
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-2">
							<Users className="w-8 h-8 text-blue-600" />
							<Badge variant="secondary">+12%</Badge>
						</div>
						<p className="text-sm text-neutral-600">Total Users</p>
						<p className="text-2xl font-bold">52.5K</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-pink-500">
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-2">
							<Heart className="w-8 h-8 text-pink-600" />
							<Badge variant="secondary">Female 58%</Badge>
						</div>
						<p className="text-sm text-neutral-600">Gender Split</p>
						<p className="text-2xl font-bold">F:M 3:2</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-purple-500">
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-2">
							<Target className="w-8 h-8 text-purple-600" />
							<Badge variant="secondary">Peak</Badge>
						</div>
						<p className="text-sm text-neutral-600">Dominant Age</p>
						<p className="text-2xl font-bold">25-34</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-green-500">
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-2">
							<Activity className="w-8 h-8 text-green-600" />
							<Badge variant="secondary">High</Badge>
						</div>
						<p className="text-sm text-neutral-600">Engagement</p>
						<p className="text-2xl font-bold">84%</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid lg:grid-cols-2 gap-6 mb-8">
				{/* Age & Gender Demographics */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="w-5 h-5 text-purple-600" />
							Age & Gender Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={350}>
							<BarChart data={ageGenderData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis dataKey="age" tick={{ fontSize: 12 }} />
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
								<Legend />
								<Bar dataKey="male" fill="#3b82f6" name="Male" radius={[8, 8, 0, 0]} />
								<Bar dataKey="female" fill="#ec4899" name="Female" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Body Type Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="w-5 h-5 text-purple-600" />
							Body Type Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={350}>
							<BarChart data={bodyTypeData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis dataKey="type" tick={{ fontSize: 12 }} />
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip />
								<Legend />
								<Bar dataKey="count" fill="#8b5cf6" name="User Count" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Skin Tone Analysis */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Eye className="w-5 h-5 text-purple-600" />
						Skin Tone Distribution & Color Affinity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-5 gap-4">
						{skinToneData.map((item, idx) => (
							<div key={idx} className="p-4 rounded-lg border-2 hover:shadow-md transition-all">
								<div 
									className="w-full h-20 rounded-lg border-2 border-neutral-200 shadow-sm mb-3"
									style={{ backgroundColor: item.color }}
								/>
								<h4 className="font-semibold text-sm text-neutral-900 mb-1">{item.tone}</h4>
								<p className="text-xs text-neutral-500 mb-2">{item.count.toLocaleString()} users</p>
								<div className="mb-2">
									<Badge variant="secondary" className="text-xs">
										{((item.count / 39600) * 100).toFixed(1)}%
									</Badge>
								</div>
								<p className="text-xs text-neutral-600">
									<span className="font-medium">Affinity:</span> {item.affinity}
								</p>
								<div className="mt-3">
									<div className="flex items-center justify-between text-xs mb-1">
										<span className="text-neutral-500">Engagement</span>
										<span className="font-semibold">{item.engagement}%</span>
									</div>
									<div className="w-full bg-neutral-100 rounded-full h-1.5">
										<div 
											className="bg-purple-500 rounded-full h-1.5"
											style={{ width: `${item.engagement}%` }}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);

	const renderProducts = () => (
		<>
			{/* Product Performance Overview */}
			<div className="grid md:grid-cols-3 gap-4 mb-8">
				<Card className="border-l-4 border-l-purple-500">
					<CardContent className="p-4">
						<Package className="w-8 h-8 text-purple-600 mb-2" />
						<p className="text-sm text-neutral-600">Total SKUs</p>
						<p className="text-2xl font-bold">1,245</p>
						<p className="text-xs text-green-600 mt-1">+38 this month</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-green-500">
					<CardContent className="p-4">
						<TrendingUp className="w-8 h-8 text-green-600 mb-2" />
						<p className="text-sm text-neutral-600">Avg Try Rate</p>
						<p className="text-2xl font-bold">26.3%</p>
						<p className="text-xs text-green-600 mt-1">+2.1% vs last period</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-amber-500">
					<CardContent className="p-4">
						<RotateCcw className="w-8 h-8 text-amber-600 mb-2" />
						<p className="text-sm text-neutral-600">Avg Return Rate</p>
						<p className="text-2xl font-bold">5.8%</p>
						<p className="text-xs text-red-600 mt-1">Monitor: 15 high-risk SKUs</p>
					</CardContent>
				</Card>
			</div>

			{/* Category Performance */}
			<div className="grid lg:grid-cols-2 gap-6 mb-8">
				<Card>
					<CardHeader>
						<CardTitle>Category Funnel Performance</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<ComposedChart data={productPerformanceData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis dataKey="category" tick={{ fontSize: 11 }} />
								<YAxis yAxisId="left" tick={{ fontSize: 11 }} />
								<YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
								<Tooltip />
								<Legend />
								<Bar yAxisId="left" dataKey="purchases" fill="#10b981" name="Purchases" radius={[8, 8, 0, 0]} />
								<Line yAxisId="right" type="monotone" dataKey="returnRate" stroke="#f59e0b" name="Return Rate %" strokeWidth={2} />
							</ComposedChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Body Type Fit Analysis */}
				<Card>
					<CardHeader>
						<CardTitle>Fit & Return Risk by Body Type</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{bodyTypeData.map((item, idx) => (
								<div key={idx} className="p-3 rounded-lg border hover:shadow-md transition-all">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-3">
											<div 
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: item.color }}
											/>
											<span className="font-semibold text-sm">{item.type}</span>
										</div>
										<Badge 
											className={item.returnRate > 5.5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
										>
											{item.returnRate}% returns
										</Badge>
									</div>
									<div className="grid grid-cols-2 gap-2 text-xs">
										<div>
											<span className="text-neutral-500">Users:</span>
											<span className="font-medium ml-1">{item.count.toLocaleString()}</span>
										</div>
										<div>
											<span className="text-neutral-500">Satisfaction:</span>
											<span className="font-medium ml-1">{item.satisfaction}%</span>
										</div>
									</div>
									{item.returnRate > 5.5 && (
										<p className="text-xs text-amber-600 mt-2">
											⚠️ Review size grading and fit guidance
										</p>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Size Recommendations */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-amber-600" />
						AI Size Guidance Recommendations
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-2 gap-4">
						{[
							{ sku: "Denim Jacket #2045", bodyType: "Pear", advice: "Recommend size up for better shoulder fit", confidence: 89 },
							{ sku: "Formal Shirt #3067", bodyType: "Apple", advice: "True to size, emphasize comfort fit", confidence: 92 },
							{ sku: "Casual Dress #4089", bodyType: "Hourglass", advice: "True to size, highlight flattering cut", confidence: 94 },
							{ sku: "Workout Tee #5012", bodyType: "Rectangle", advice: "Recommend fitted style for definition", confidence: 87 }
						].map((rec, idx) => (
							<div key={idx} className="p-4 rounded-lg bg-purple-50 border border-purple-200">
								<div className="flex items-start justify-between mb-2">
									<h4 className="font-semibold text-sm">{rec.sku}</h4>
									<Badge variant="secondary" className="text-xs">
										{rec.confidence}% confident
									</Badge>
								</div>
								<p className="text-xs text-neutral-600 mb-2">
									For <span className="font-medium">{rec.bodyType}</span> body type
								</p>
								<p className="text-sm text-purple-900">{rec.advice}</p>
								<Button size="sm" variant="outline" className="mt-3 text-xs">
									Apply to Product Page
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);

	const renderTrends = () => (
		<>
			{/* Trend Metrics */}
			<div className="grid md:grid-cols-4 gap-4 mb-8">
				<Card className="border-l-4 border-l-pink-500">
					<CardContent className="p-4">
						<Sparkles className="w-8 h-8 text-pink-600 mb-2" />
						<p className="text-sm text-neutral-600">Active Trends</p>
						<p className="text-2xl font-bold">23</p>
						<p className="text-xs text-neutral-500 mt-1">8 emerging</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-green-500">
					<CardContent className="p-4">
						<TrendingUp className="w-8 h-8 text-green-600 mb-2" />
						<p className="text-sm text-neutral-600">Fastest Growing</p>
						<p className="text-xl font-bold">Loungewear</p>
						<p className="text-xs text-green-600 mt-1">+45% this week</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-blue-500">
					<CardContent className="p-4">
						<Calendar className="w-8 h-8 text-blue-600 mb-2" />
						<p className="text-sm text-neutral-600">Seasonal Peak</p>
						<p className="text-2xl font-bold">Q2</p>
						<p className="text-xs text-neutral-500 mt-1">Wedding season</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-purple-500">
					<CardContent className="p-4">
						<Target className="w-8 h-8 text-purple-600 mb-2" />
						<p className="text-sm text-neutral-600">Forecast Accuracy</p>
						<p className="text-2xl font-bold">84%</p>
						<p className="text-xs text-green-600 mt-1">+3% improvement</p>
					</CardContent>
				</Card>
			</div>

			{/* 6-Month Trend Timeline */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-purple-600" />
						6-Month Occasion Trend Evolution
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={350}>
						<AreaChart data={trendTimelineData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
							<XAxis dataKey="month" tick={{ fontSize: 12 }} />
							<YAxis tick={{ fontSize: 12 }} />
							<Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
							<Legend />
							<Area type="monotone" dataKey="casual" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
							<Area type="monotone" dataKey="formal" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
							<Area type="monotone" dataKey="party" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
							<Area type="monotone" dataKey="workout" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
						</AreaChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Demand Forecast */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="w-5 h-5 text-purple-600" />
						6-Week Demand Forecast
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<ComposedChart data={demandForecastData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
							<XAxis dataKey="week" tick={{ fontSize: 12 }} />
							<YAxis yAxisId="left" tick={{ fontSize: 12 }} />
							<YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
							<Tooltip />
							<Legend />
							<Bar yAxisId="left" dataKey="actual" fill="#10b981" name="Actual Sales" radius={[8, 8, 0, 0]} />
							<Line yAxisId="left" type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={3} name="Predicted" strokeDasharray="5 5" />
							<Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#f59e0b" strokeWidth={2} name="Confidence %" />
						</ComposedChart>
					</ResponsiveContainer>
					<div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
						<p className="text-sm text-blue-900">
							<strong>Insight:</strong> Predicted 28% demand increase in W4-W6. Recommend pre-ordering popular SKUs to avoid stockouts.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Trend Alerts */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="w-5 h-5 text-amber-600" />
						Real-Time Trend Alerts
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[
							{ trend: "Oversized Blazers", change: "+67%", region: "Mumbai", status: "hot", action: "Launch capsule" },
							{ trend: "Pastel Coordinates", change: "+52%", region: "Delhi", status: "emerging", action: "Monitor closely" },
							{ trend: "Metallic Accessories", change: "+41%", region: "Bangalore", status: "growing", action: "Expand inventory" },
							{ trend: "Sustainable Fabrics", change: "+38%", region: "Pune", status: "steady", action: "Source suppliers" }
						].map((alert, idx) => (
							<div 
								key={idx}
								className={`p-4 rounded-lg border-2 ${
									alert.status === "hot" ? "border-red-300 bg-red-50" :
									alert.status === "emerging" ? "border-amber-300 bg-amber-50" :
									"border-blue-300 bg-blue-50"
								}`}
							>
								<div className="flex items-center justify-between mb-2">
									<h4 className="font-semibold text-neutral-900">{alert.trend}</h4>
									<Badge 
										className={
											alert.status === "hot" ? "bg-red-600" :
											alert.status === "emerging" ? "bg-amber-600" :
											"bg-blue-600"
										}
									>
										{alert.change}
									</Badge>
								</div>
								<p className="text-sm text-neutral-600 mb-2">
									<MapPin className="w-3 h-3 inline mr-1" />
									{alert.region}
								</p>
								<Button size="sm" variant="outline" className="text-xs">
									{alert.action} →
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);

	const renderOperations = () => (
		<>
			{/* Operations Overview */}
			<div className="grid md:grid-cols-4 gap-4 mb-8">
				<Card className="border-l-4 border-l-red-500">
					<CardContent className="p-4">
						<AlertCircle className="w-8 h-8 text-red-600 mb-2" />
						<p className="text-sm text-neutral-600">Critical Alerts</p>
						<p className="text-2xl font-bold">8</p>
						<p className="text-xs text-red-600 mt-1">Requires action</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-amber-500">
					<CardContent className="p-4">
						<Package className="w-8 h-8 text-amber-600 mb-2" />
						<p className="text-sm text-neutral-600">Low Stock Items</p>
						<p className="text-2xl font-bold">23</p>
						<p className="text-xs text-amber-600 mt-1">Monitor closely</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-green-500">
					<CardContent className="p-4">
						<TrendingUp className="w-8 h-8 text-green-600 mb-2" />
						<p className="text-sm text-neutral-600">Fill Rate</p>
						<p className="text-2xl font-bold">94.2%</p>
						<p className="text-xs text-green-600 mt-1">Excellent</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-purple-500">
					<CardContent className="p-4">
						<DollarSign className="w-8 h-8 text-purple-600 mb-2" />
						<p className="text-sm text-neutral-600">Returns Cost</p>
						<p className="text-2xl font-bold">₹2.4L</p>
						<p className="text-xs text-neutral-500 mt-1">This month</p>
					</CardContent>
				</Card>
			</div>

			{/* Inventory Risk Table */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package className="w-5 h-5 text-purple-600" />
						Inventory Risk Analysis
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b-2">
									<th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">SKU</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Product</th>
									<th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">Current Stock</th>
									<th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">Predicted Demand</th>
									<th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">Risk</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Action</th>
									<th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700"></th>
								</tr>
							</thead>
							<tbody>
								{inventoryData.map((item, idx) => (
									<tr key={idx} className="border-b hover:bg-neutral-50 transition-colors">
										<td className="py-3 px-4 text-sm font-mono">{item.sku}</td>
										<td className="py-3 px-4 text-sm">{item.name}</td>
										<td className="py-3 px-4 text-center">
											<span className={`font-semibold ${item.stock < item.predicted * 0.5 ? "text-red-600" : "text-neutral-900"}`}>
												{item.stock}
											</span>
										</td>
										<td className="py-3 px-4 text-center text-sm text-neutral-700">{item.predicted}</td>
										<td className="py-3 px-4 text-center">
											<Badge 
												className={
													item.risk === "high" ? "bg-red-100 text-red-700" :
													item.risk === "medium" ? "bg-amber-100 text-amber-700" :
													"bg-green-100 text-green-700"
												}
											>
												{item.risk}
											</Badge>
										</td>
										<td className="py-3 px-4 text-sm text-neutral-600">{item.action}</td>
										<td className="py-3 px-4 text-center">
											<Button size="sm" variant="outline" className="text-xs">
												Generate PO
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Action Items & Alerts */}
			<Card className="border-l-4 border-l-amber-500">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-amber-600" />
						Priority Action Items
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[
							{
								priority: "high",
								title: "Urgent Restock: Size M Casual Tees",
								description: "Stock will run out in 3 days based on current demand. Mumbai warehouse critical.",
								action: "Generate Emergency PO",
								icon: Package
							},
							{
								priority: "high",
								title: "Return Rate Spike: SKU #45821",
								description: "Pear body type showing 8.2% return rate (fit issue). 23 returns this week.",
								action: "Review Size Grading",
								icon: RotateCcw
							},
							{
								priority: "medium",
								title: "Price Optimization Opportunity",
								description: "5 slow-moving SKUs with high inventory. Recommend 15% markdown.",
								action: "Create Markdown Plan",
								icon: DollarSign
							},
							{
								priority: "medium",
								title: "Supplier Delay Alert",
								description: "Denim shipment delayed by 7 days. May impact Week 5 demand fulfillment.",
								action: "Contact Supplier",
								icon: AlertCircle
							},
							{
								priority: "low",
								title: "Quality Check Required",
								description: "3 SKUs with higher-than-average feedback on stitching quality.",
								action: "Schedule QA Review",
								icon: Shield
							}
						].map((alert, idx) => (
							<div 
								key={idx}
								className={`p-4 rounded-lg border-2 flex items-start gap-4 ${
									alert.priority === "high" ? "border-red-200 bg-red-50" :
									alert.priority === "medium" ? "border-amber-200 bg-amber-50" :
									"border-blue-200 bg-blue-50"
								}`}
							>
								<div className={`p-2 rounded-lg ${
									alert.priority === "high" ? "bg-red-100" :
									alert.priority === "medium" ? "bg-amber-100" :
									"bg-blue-100"
								}`}>
									<alert.icon className={`w-5 h-5 ${
										alert.priority === "high" ? "text-red-600" :
										alert.priority === "medium" ? "text-amber-600" :
										"text-blue-600"
									}`} />
								</div>
								<div className="flex-1">
									<div className="flex items-start justify-between mb-1">
										<h4 className="font-semibold text-neutral-900">{alert.title}</h4>
										<Badge 
											variant="secondary"
											className={
												alert.priority === "high" ? "bg-red-100 text-red-700" :
												alert.priority === "medium" ? "bg-amber-100 text-amber-700" :
												"bg-blue-100 text-blue-700"
											}
										>
											{alert.priority.toUpperCase()}
										</Badge>
									</div>
									<p className="text-sm text-neutral-600 mb-3">{alert.description}</p>
									<Button size="sm" variant="outline" className="text-xs">
										{alert.action} →
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
			{/* Header */}
			<div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
				<div className="mx-auto max-w-[1600px] px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-8">
							<div>
								<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
									<span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
										CAF
									</span>
									<Badge variant="secondary" className="text-xs">Brand Portal</Badge>
								</Link>
							</div>
							<nav className="hidden md:flex items-center gap-6">
								<button 
									onClick={() => setActiveTab("overview")}
									className={`text-sm font-medium transition-colors pb-1 ${
										activeTab === "overview" 
											? "text-purple-600 border-b-2 border-purple-600" 
											: "text-neutral-600 hover:text-purple-600"
									}`}
								>
									Overview
								</button>
								<button 
									onClick={() => setActiveTab("audience")}
									className={`text-sm font-medium transition-colors pb-1 ${
										activeTab === "audience" 
											? "text-purple-600 border-b-2 border-purple-600" 
											: "text-neutral-600 hover:text-purple-600"
									}`}
								>
									Audience
								</button>
								<button 
									onClick={() => setActiveTab("products")}
									className={`text-sm font-medium transition-colors pb-1 ${
										activeTab === "products" 
											? "text-purple-600 border-b-2 border-purple-600" 
											: "text-neutral-600 hover:text-purple-600"
									}`}
								>
									Products
								</button>
								<button 
									onClick={() => setActiveTab("trends")}
									className={`text-sm font-medium transition-colors pb-1 ${
										activeTab === "trends" 
											? "text-purple-600 border-b-2 border-purple-600" 
											: "text-neutral-600 hover:text-purple-600"
									}`}
								>
									Trends
								</button>
								<button 
									onClick={() => setActiveTab("operations")}
									className={`text-sm font-medium transition-colors pb-1 ${
										activeTab === "operations" 
											? "text-purple-600 border-b-2 border-purple-600" 
											: "text-neutral-600 hover:text-purple-600"
									}`}
								>
									Operations
								</button>
							</nav>
						</div>
						<div className="flex items-center gap-3">
							<Button variant="outline" size="sm" className="gap-2">
								<Bell className="w-4 h-4" />
								<span className="hidden sm:inline">Alerts</span>
								<Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
									8
								</Badge>
							</Button>
							<Button variant="outline" size="sm" className="gap-2">
								<Download className="w-4 h-4" />
								<span className="hidden sm:inline">Export</span>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-[1600px] px-6 py-8">
				{/* Page Title & Filters */}
				<div className="mb-8">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<div>
							<h1 className="text-3xl font-bold text-neutral-900 mb-2">
								{activeTab === "overview" && "Executive Overview"}
								{activeTab === "audience" && "Audience Intelligence"}
								{activeTab === "products" && "Product & Fit Analysis"}
								{activeTab === "trends" && "Trends & Forecasting"}
								{activeTab === "operations" && "Operations & Inventory"}
							</h1>
							<p className="text-neutral-600">
								{activeTab === "overview" && "Real-time insights into your style ecosystem"}
								{activeTab === "audience" && "Understand your users and their behaviors"}
								{activeTab === "products" && "Product performance and fit optimization"}
								{activeTab === "trends" && "Emerging trends and demand predictions"}
								{activeTab === "operations" && "Inventory management and operational alerts"}
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button variant="outline" size="sm" className="gap-2">
								<Filter className="w-4 h-4" />
								Filters
								<ChevronDown className="w-4 h-4" />
							</Button>
							<div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
								{["7d", "30d", "90d", "YTD"].map((range) => (
									<button
										key={range}
										onClick={() => setDateRange(range)}
										className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
											dateRange === range
												? "bg-purple-600 text-white shadow-sm"
												: "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
										}`}
									>
										{range}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Render Active Tab Content */}
				{activeTab === "overview" && renderOverview()}
				{activeTab === "audience" && renderAudience()}
				{activeTab === "products" && renderProducts()}
				{activeTab === "trends" && renderTrends()}
				{activeTab === "operations" && renderOperations()}
			</div>
		</div>
	);
}
