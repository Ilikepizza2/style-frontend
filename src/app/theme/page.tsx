"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useState } from "react";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, CartesianGrid, XAxis, YAxis } from "recharts";

const barChartData = [
	{ month: "Jan", revenue: 4200, expenses: 2400 },
	{ month: "Feb", revenue: 3800, expenses: 2200 },
	{ month: "Mar", revenue: 5100, expenses: 2800 },
	{ month: "Apr", revenue: 4600, expenses: 2600 },
	{ month: "May", revenue: 5400, expenses: 3100 },
	{ month: "Jun", revenue: 6200, expenses: 3400 },
];

const lineChartData = [
	{ day: "Mon", users: 186 },
	{ day: "Tue", users: 305 },
	{ day: "Wed", users: 237 },
	{ day: "Thu", users: 273 },
	{ day: "Fri", users: 409 },
	{ day: "Sat", users: 314 },
	{ day: "Sun", users: 256 },
];

const pieChartData = [
	{ category: "Desktop", value: 275, fill: "var(--color-chart-1)" },
	{ category: "Mobile", value: 200, fill: "var(--color-chart-2)" },
	{ category: "Tablet", value: 187, fill: "var(--color-chart-3)" },
	{ category: "Other", value: 173, fill: "var(--color-chart-4)" },
];

const chartConfig = {
	revenue: {
		label: "Revenue",
		color: "hsl(var(--chart-1))",
	},
	expenses: {
		label: "Expenses",
		color: "hsl(var(--chart-2))",
	},
	users: {
		label: "Users",
		color: "hsl(var(--chart-1))",
	},
	desktop: {
		label: "Desktop",
		color: "hsl(var(--chart-1))",
	},
	mobile: {
		label: "Mobile",
		color: "hsl(var(--chart-2))",
	},
	tablet: {
		label: "Tablet",
		color: "hsl(var(--chart-3))",
	},
	other: {
		label: "Other",
		color: "hsl(var(--chart-4))",
	},
} satisfies ChartConfig;

export default function Home() {
	const [switchState, setSwitchState] = useState(false);

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold text-foreground">Component Showcase</h1>
						<p className="text-muted-foreground mt-2">Testing shadcn/ui with next-themes</p>
					</div>
					<ThemeToggle />
				</div>

				{/* Buttons Section */}
				<Card>
					<CardHeader>
						<CardTitle>Buttons</CardTitle>
						<CardDescription>Different button variants and sizes</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-4">
						<Button>Default</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="destructive">Destructive</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="link">Link</Button>
					</CardContent>
					<CardFooter className="flex gap-4">
						<Button size="sm">Small</Button>
						<Button size="default">Default</Button>
						<Button size="lg">Large</Button>
					</CardFooter>
				</Card>

				{/* Cards & Badges Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Card Title</CardTitle>
							<CardDescription>Card description goes here</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-foreground">This is a basic card component with some content inside.</p>
						</CardContent>
						<CardFooter className="flex gap-2">
							<Badge>Default</Badge>
							<Badge variant="secondary">Secondary</Badge>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Status Badges</CardTitle>
							<CardDescription>Different badge variants</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Badge>Badge</Badge>
								<Badge variant="secondary">Secondary</Badge>
							</div>
							<div className="flex gap-2">
								<Badge variant="destructive">Destructive</Badge>
								<Badge variant="outline">Outline</Badge>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Form Controls</CardTitle>
							<CardDescription>Input and switch components</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Input placeholder="Enter text..." />
							<div className="flex items-center justify-between">
								<span className="text-sm">Toggle switch</span>
								<Switch
									checked={switchState}
									onCheckedChange={setSwitchState}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Typography & Colors */}
				<Card>
					<CardHeader>
						<CardTitle>Typography & Colors</CardTitle>
						<CardDescription>Testing color variables and text styles</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<h3 className="text-lg font-semibold">Color Palette</h3>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<div className="w-10 h-10 rounded-md bg-primary border" />
										<span className="text-sm">Primary</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-10 h-10 rounded-md bg-secondary border" />
										<span className="text-sm">Secondary</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-10 h-10 rounded-md bg-accent border" />
										<span className="text-sm">Accent</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-10 h-10 rounded-md bg-muted border" />
										<span className="text-sm">Muted</span>
									</div>
								</div>
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-semibold">Text Styles</h3>
								<p className="text-foreground">Default foreground text</p>
								<p className="text-muted-foreground">Muted foreground text</p>
								<p className="text-primary">Primary colored text</p>
								<p className="text-secondary">Secondary colored text</p>
								<p className="text-destructive">Destructive colored text</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Interactive Form */}
				<Card>
					<CardHeader>
						<CardTitle>Sample Form</CardTitle>
						<CardDescription>Complete form with various components</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Email</label>
							<Input
								type="email"
								placeholder="email@example.com"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Password</label>
							<Input
								type="password"
								placeholder="••••••••"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Switch id="remember" />
							<label
								htmlFor="remember"
								className="text-sm"
							>
								Remember me
							</label>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline">Cancel</Button>
						<Button>Submit</Button>
					</CardFooter>
				</Card>

				{/* Charts Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Bar Chart</CardTitle>
							<CardDescription>Revenue vs Expenses (2024)</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer
								config={chartConfig}
								className="h-[300px] w-full"
							>
								<BarChart data={barChartData}>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-muted"
									/>
									<XAxis
										dataKey="month"
										className="text-xs"
									/>
									<YAxis className="text-xs" />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Bar
										dataKey="revenue"
										fill="var(--color-chart-1)"
										radius={4}
									/>
									<Bar
										dataKey="expenses"
										fill="var(--color-chart-2)"
										radius={4}
									/>
								</BarChart>
							</ChartContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Line Chart</CardTitle>
							<CardDescription>Daily Active Users (This Week)</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer
								config={chartConfig}
								className="h-[300px] w-full"
							>
								<LineChart data={lineChartData}>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-muted"
									/>
									<XAxis
										dataKey="day"
										className="text-xs"
									/>
									<YAxis className="text-xs" />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Line
										type="monotone"
										dataKey="users"
										stroke="var(--color-chart-1)"
										strokeWidth={2}
										dot={{ fill: "var(--color-chart-1)" }}
									/>
								</LineChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Pie Chart</CardTitle>
						<CardDescription>Traffic by Device Type</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<ChartContainer
							config={chartConfig}
							className="h-[300px] w-full max-w-[300px]"
						>
							<PieChart>
								<ChartTooltip content={<ChartTooltipContent />} />
								<Pie
									data={pieChartData}
									dataKey="value"
									nameKey="category"
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={2}
								/>
							</PieChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
