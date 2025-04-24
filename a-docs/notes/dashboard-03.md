Project Path: dashboard-03

Source Tree:

```
dashboard-03
├── customers
│   └── page.tsx
├── settings
│   └── page.tsx
├── components
│   ├── chart-revenue.tsx
│   ├── search-form.tsx
│   ├── chart-visitors.tsx
│   ├── nav-main.tsx
│   ├── products-table.tsx
│   ├── site-header.tsx
│   ├── nav-user.tsx
│   ├── app-sidebar.tsx
│   ├── analytics-date-picker.tsx
│   ├── mode-toggle.tsx
│   └── nav-secondary.tsx
├── layout.tsx
└── page.tsx

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/customers/page.tsx`:

```tsx
export default function CustomersPage() {
  return (
    <div className="p-6">
      <div className="bg-input p-4">Input</div>
      <div className="bg-input/30 p-4">Input 50</div>
    </div>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/settings/page.tsx`:

```tsx
import { Metadata } from "next"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import { Checkbox } from "@/registry/new-york-v4/ui/checkbox"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Label } from "@/registry/new-york-v4/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select"
import { Switch } from "@/registry/new-york-v4/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york-v4/ui/tabs"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
}

const timezones = [
  {
    label: "Americas",
    timezones: [
      { value: "America/New_York", label: "(GMT-5) New York" },
      { value: "America/Los_Angeles", label: "(GMT-8) Los Angeles" },
      { value: "America/Chicago", label: "(GMT-6) Chicago" },
      { value: "America/Toronto", label: "(GMT-5) Toronto" },
      { value: "America/Vancouver", label: "(GMT-8) Vancouver" },
      { value: "America/Sao_Paulo", label: "(GMT-3) São Paulo" },
    ],
  },
  {
    label: "Europe",
    timezones: [
      { value: "Europe/London", label: "(GMT+0) London" },
      { value: "Europe/Paris", label: "(GMT+1) Paris" },
      { value: "Europe/Berlin", label: "(GMT+1) Berlin" },
      { value: "Europe/Rome", label: "(GMT+1) Rome" },
      { value: "Europe/Madrid", label: "(GMT+1) Madrid" },
      { value: "Europe/Amsterdam", label: "(GMT+1) Amsterdam" },
    ],
  },
  {
    label: "Asia/Pacific",
    timezones: [
      { value: "Asia/Tokyo", label: "(GMT+9) Tokyo" },
      { value: "Asia/Shanghai", label: "(GMT+8) Shanghai" },
      { value: "Asia/Singapore", label: "(GMT+8) Singapore" },
      { value: "Asia/Dubai", label: "(GMT+4) Dubai" },
      { value: "Australia/Sydney", label: "(GMT+11) Sydney" },
      { value: "Asia/Seoul", label: "(GMT+9) Seoul" },
    ],
  },
] as const

const loginHistory = [
  {
    date: "2024-01-01",
    ip: "192.168.1.1",
    location: "New York, USA",
  },
  {
    date: "2023-12-29",
    ip: "172.16.0.100",
    location: "London, UK",
  },
  {
    date: "2023-12-28",
    ip: "10.0.0.50",
    location: "Toronto, Canada",
  },
  {
    date: "2023-12-25",
    ip: "192.168.2.15",
    location: "Sydney, Australia",
  },
] as const

const activeSessions = [
  {
    device: "MacBook Pro",
    browser: "Chrome",
    os: "macOS",
  },
  {
    device: "iPhone",
    browser: "Safari",
    os: "iOS",
  },
  {
    device: "iPad",
    browser: "Safari",
    os: "iOS",
  },
  {
    device: "Android Phone",
    browser: "Chrome",
    os: "Android",
  },
] as const

export default function SettingsPage() {
  return (
    <div className="@container/page flex flex-1 flex-col gap-8 p-6">
      <Tabs defaultValue="account" className="gap-6">
        <div
          data-slot="dashboard-header"
          className="flex items-center justify-between"
        >
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="account" className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Make changes to your account here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="form-account" className="@container">
                <FieldGroup>
                  <Field>
                    <Label htmlFor="name">Name</Label>
                    <FieldControl>
                      <Input
                        id="name"
                        placeholder="First and last name"
                        required
                      />
                    </FieldControl>
                    <FieldDescription>
                      This is your public display name.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Label htmlFor="email">Email</Label>
                    <FieldControl>
                      <Input
                        id="email"
                        placeholder="you@example.com"
                        required
                      />
                    </FieldControl>
                  </Field>
                  <Field>
                    <Label htmlFor="timezone">Timezone</Label>
                    <FieldControl>
                      <Select>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectGroup key={timezone.label}>
                              <SelectLabel>{timezone.label}</SelectLabel>
                              {timezone.timezones.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldControl>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="border-t">
              <Button type="submit" form="form-account" variant="secondary">
                Save changes
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="form-notifications" className="@container">
                <FieldGroup>
                  <Field>
                    <Label htmlFor="channels">Notification Channels</Label>
                    <FieldControl className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="notification-email" />
                        <Label htmlFor="notification-email">Email</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="notification-sms" />
                        <Label htmlFor="notification-sms">SMS</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="notification-push" />
                        <Label htmlFor="notification-push">Push</Label>
                      </div>
                    </FieldControl>
                    <FieldDescription>
                      Choose how you want to receive notifications.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Label htmlFor="types">Notification Types</Label>
                    <FieldControl className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="notification-account" />
                        <Label htmlFor="notification-account">
                          Account Activity
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="notification-security"
                          defaultChecked
                          disabled
                        />
                        <Label htmlFor="notification-security">
                          Security Alerts
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="notification-marketing" />
                        <Label htmlFor="notification-marketing">
                          Marketing & Promotions
                        </Label>
                      </div>
                    </FieldControl>
                    <FieldDescription>
                      Choose how you want to receive notifications.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="border-t">
              <Button
                type="submit"
                form="form-notifications"
                variant="secondary"
              >
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent
          value="security"
          className="grid gap-6 @3xl/page:grid-cols-2"
        >
          <Card className="@3xl/page:col-span-2">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Make changes to your security settings here.
              </CardDescription>
            </CardHeader>
            <CardContent className="@container">
              <form id="form-security">
                <FieldGroup>
                  <Field>
                    <Label htmlFor="current-password">Current Password</Label>
                    <FieldControl>
                      <Input
                        id="current-password"
                        placeholder="Current password"
                        required
                      />
                    </FieldControl>
                    <FieldDescription>
                      This is your current password.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Label htmlFor="new-password">New Password</Label>
                    <FieldControl>
                      <Input
                        id="new-password"
                        placeholder="New password"
                        required
                      />
                    </FieldControl>
                  </Field>
                  <Field>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <FieldControl>
                      <Input
                        id="confirm-password"
                        placeholder="Confirm password"
                      />
                    </FieldControl>
                  </Field>
                  <Field>
                    <FieldControl>
                      <Switch
                        id="enable-two-factor-auth"
                        className="self-start"
                      />
                    </FieldControl>
                    <Label htmlFor="enable-two-factor-auth">
                      Enable two-factor authentication
                    </Label>
                    <FieldDescription>
                      This will add an extra layer of security to your account.
                      Make this an extra long description to test the layout.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="border-t">
              <Button type="submit" form="form-security" variant="secondary">
                Save changes
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>
                Recent login activities on your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden @md/page:table-cell">
                      IP
                    </TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.map((login) => (
                    <TableRow key={login.date}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {new Date(login.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          <span className="flex @md/page:hidden">
                            {login.ip}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden @md/page:table-cell">
                        {login.ip}
                      </TableCell>
                      <TableCell>{login.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Current active sessions on your account.
              </CardDescription>
              <CardAction>
                <Button variant="outline" size="sm">
                  <span className="hidden @md/card-header:block">
                    Manage Sessions
                  </span>
                  <span className="block @md/card-header:hidden">Manage</span>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.map((session) => (
                    <TableRow key={session.device}>
                      <TableCell>{session.device}</TableCell>
                      <TableCell>{session.browser}</TableCell>
                      <TableCell>{session.os}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FieldGroup({ children }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className="@container/field-group flex max-w-4xl min-w-0 flex-col gap-8 @3xl:gap-6"
    >
      {children}
    </div>
  )
}

function Field({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn(
        "grid auto-rows-min items-start gap-3 *:data-[slot=label]:col-start-1 *:data-[slot=label]:row-start-1 @3xl/field-group:grid-cols-2 @3xl/field-group:gap-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function FieldControl({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-control"
      className={cn(
        "@3xl/field-group:col-start-2 @3xl/field-group:row-span-2 @3xl/field-group:row-start-1 @3xl/field-group:self-start",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function FieldDescription({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm @3xl/field-group:col-start-1 @3xl/field-group:row-start-1 @3xl/field-group:translate-y-6",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/chart-revenue.tsx`:

```tsx
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/new-york-v4/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 346, mobile: 140 },
  { month: "July", desktop: 321, mobile: 275 },
  { month: "August", desktop: 132, mobile: 95 },
  { month: "September", desktop: 189, mobile: 225 },
  { month: "October", desktop: 302, mobile: 248 },
  { month: "November", desktop: 342, mobile: 285 },
  { month: "December", desktop: 328, mobile: 290 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartRevenue() {
  return (
    <Card>
      <CardHeader>
        <CardDescription>January - June 2024</CardDescription>
        <CardTitle className="text-3xl font-bold tracking-tight">
          $45,231.89
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[3/1]">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -16,
              right: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
              domain={[0, "dataMax"]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator />}
            />
            <Bar
              dataKey="desktop"
              fill="var(--color-desktop)"
              radius={[0, 0, 4, 4]}
              stackId={1}
            />
            <Bar
              dataKey="mobile"
              fill="var(--color-mobile)"
              radius={[4, 4, 0, 0]}
              stackId={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/search-form.tsx`:

```tsx
import { Search } from "lucide-react"

import { Label } from "@/registry/new-york-v4/ui/label"
import { SidebarInput } from "@/registry/new-york-v4/ui/sidebar"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Type to search..."
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/chart-visitors.tsx`:

```tsx
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/new-york-v4/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select"

const desktopData = [
  { month: "january", desktop: 186, fill: "var(--color-january)" },
  { month: "february", desktop: 305, fill: "var(--color-february)" },
  { month: "march", desktop: 237, fill: "var(--color-march)" },
  { month: "april", desktop: 173, fill: "var(--color-april)" },
  { month: "may", desktop: 209, fill: "var(--color-may)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
  january: {
    label: "January",
    color: "var(--chart-1)",
  },
  february: {
    label: "February",
    color: "var(--chart-2)",
  },
  march: {
    label: "March",
    color: "var(--chart-3)",
  },
  april: {
    label: "April",
    color: "var(--chart-4)",
  },
  may: {
    label: "May",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartVisitors() {
  const id = "pie-interactive"
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month)

  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.month === activeMonth),
    [activeMonth]
  )
  const months = React.useMemo(() => desktopData.map((item) => item.month), [])

  return (
    <Card data-chart={id}>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader>
        <CardDescription>January - June 2024</CardDescription>
        <CardTitle className="text-2xl font-bold">1,234 visitors</CardTitle>
        <CardAction>
          <Select value={activeMonth} onValueChange={setActiveMonth}>
            <SelectTrigger
              className="ml-auto h-8 w-[120px]"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent align="end">
              {months.map((key) => {
                const config = chartConfig[key as keyof typeof chartConfig]

                if (!config) {
                  return null
                }

                const color = "color" in config ? config.color : undefined

                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded-sm"
                        style={{
                          backgroundColor: color,
                        }}
                      />
                      {config?.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={desktopData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {desktopData[activeIndex].desktop.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/nav-main.tsx`:

```tsx
"use client"

import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/new-york-v4/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/registry/new-york-v4/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
    disabled?: boolean
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={pathname === item.url}
                disabled={item.disabled}
              >
                <a
                  href={item.disabled ? "#" : item.url}
                  data-disabled={item.disabled}
                  className="data-[disabled=true]:opacity-50"
                >
                  <item.icon className="text-muted-foreground" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/products-table.tsx`:

```tsx
import {
  ArrowUpDownIcon,
  EllipsisVerticalIcon,
  ListFilterIcon,
  PlusIcon,
} from "lucide-react"

import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/registry/new-york-v4/ui/card"
import { Checkbox } from "@/registry/new-york-v4/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/new-york-v4/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/new-york-v4/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/registry/new-york-v4/ui/tabs"

export function ProductsTable({
  products,
}: {
  products: {
    id: string
    name: string
    price: number
    stock: number
    dateAdded: string
    status: string
  }[]
}) {
  return (
    <Card className="flex w-full flex-col gap-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <Tabs defaultValue="all">
          <TabsList className="w-full @3xl/page:w-fit">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="in-stock">In Stock</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="add-product" asChild>
              <button>
                <PlusIcon />
              </button>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="hidden items-center gap-2 **:data-[slot=button]:size-8 **:data-[slot=select-trigger]:h-8 @3xl/page:flex">
          <Select defaultValue="all">
            <SelectTrigger>
              <span className="text-muted-foreground text-sm">Category:</span>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger>
              <span className="text-muted-foreground text-sm">Price:</span>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">$100-$200</SelectItem>
              <SelectItem value="in-stock">$200-$300</SelectItem>
              <SelectItem value="low-stock">$300-$400</SelectItem>
              <SelectItem value="archived">$400-$500</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger>
              <span className="text-muted-foreground text-sm">Status:</span>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">In Stock</SelectItem>
              <SelectItem value="in-stock">Low Stock</SelectItem>
              <SelectItem value="low-stock">Archived</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <ListFilterIcon />
          </Button>
          <Button variant="outline" size="icon">
            <ArrowUpDownIcon />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-4">
                <Checkbox />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:py-2.5">
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="px-4">
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      product.status === "Low Stock"
                        ? "border-orange-700 bg-transparent text-orange-700 dark:border-orange-700 dark:bg-transparent dark:text-orange-700"
                        : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100"
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(product.dateAdded).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-6">
                        <EllipsisVerticalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-between border-t pt-6 @3xl/page:flex-row">
        <div className="text-muted-foreground hidden text-sm @3xl/page:block">
          Showing 1-10 of 100 products
        </div>
        <Pagination className="mx-0 w-fit">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/site-header.tsx`:

```tsx
"use client"

import { Fragment, useMemo } from "react"
import { usePathname } from "next/navigation"
import { SidebarIcon } from "lucide-react"

import { ThemeSelector } from "@/components/theme-selector"
import { SearchForm } from "@/registry/new-york-v4/blocks/sidebar-16/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/new-york-v4/ui/breadcrumb"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Separator } from "@/registry/new-york-v4/ui/separator"
import { useSidebar } from "@/registry/new-york-v4/ui/sidebar"
import { ModeToggle } from "@/app/(examples)/dashboard-03/components/mode-toggle"
import { NavUser } from "@/app/(examples)/dashboard-03/components/nav-user"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()

  // Faux breadcrumbs for demo.
  const breadcrumbs = useMemo(() => {
    return pathname
      .split("/")
      .filter((path) => path !== "")
      .map((path, index, array) => ({
        label: path,
        href: `/${array.slice(0, index + 1).join("/")}`,
      }))
  }, [pathname])

  return (
    <header
      data-slot="site-header"
      className="bg-background sticky top-0 z-50 flex w-full items-center border-b"
    >
      <div className="flex h-(--header-height) w-full items-center gap-2 px-2 pr-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="gap-2.5 has-[>svg]:px-2"
        >
          <SidebarIcon />
          <span className="truncate font-medium">Acme Inc</span>
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="capitalize">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {breadcrumbs.map((breadcrumb, index) =>
              index === breadcrumbs.length - 1 ? (
                <BreadcrumbItem key={index}>
                  <BreadcrumbPage className="capitalize">
                    {breadcrumb.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <Fragment key={index}>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={breadcrumb.href}
                      className="capitalize"
                    >
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </Fragment>
              )
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <SearchForm className="w-fullsm:w-auto" />
          <ThemeSelector />
          <ModeToggle />
          <NavUser
            user={{
              name: "shadcn",
              email: "m@example.com",
              avatar: "/avatars/shadcn.jpg",
            }}
          />
        </div>
      </div>
    </header>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/nav-user.tsx`:

```tsx
"use client"

import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york-v4/ui/avatar"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york-v4/ui/dropdown-menu"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Avatar className="size-8 rounded-md">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/app-sidebar.tsx`:

```tsx
"use client"

import * as React from "react"
import {
  ChartLineIcon,
  FileIcon,
  HomeIcon,
  LifeBuoy,
  Send,
  Settings2Icon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react"

import { Sidebar, SidebarContent } from "@/registry/new-york-v4/ui/sidebar"
import { NavMain } from "@/app/(examples)/dashboard-03/components/nav-main"
import { NavSecondary } from "@/app/(examples)/dashboard-03/components/nav-secondary"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: HomeIcon,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: ChartLineIcon,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: ShoppingBagIcon,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: ShoppingCartIcon,
    },
    {
      title: "Invoices",
      url: "/dashboard/invoices",
      icon: FileIcon,
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: UserIcon,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2Icon,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/analytics-date-picker.tsx`:

```tsx
"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Calendar } from "@/registry/new-york-v4/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover"

export function AnalyticsDatePicker() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            "w-fit justify-start px-2 font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="text-muted-foreground" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/mode-toggle.tsx`:

```tsx
"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/registry/new-york-v4/ui/button"

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="secondary"
      size="icon"
      className="group/toggle size-8"
      onClick={toggleTheme}
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/components/nav-secondary.tsx`:

```tsx
import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/registry/new-york-v4/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/layout.tsx`:

```tsx
import { cookies } from "next/headers"

import {
  SidebarInset,
  SidebarProvider,
} from "@/registry/new-york-v4/ui/sidebar"
import { AppSidebar } from "@/app/(examples)/dashboard-03/components/app-sidebar"
import { SiteHeader } from "@/app/(examples)/dashboard-03/components/site-header"

import "../../themes.css"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <main className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider defaultOpen={defaultOpen} className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </main>
  )
}

```

`/Users/d.andrews/Downloads/ui-main/apps/v4/app/(examples)/dashboard-03/page.tsx`:

```tsx
import { Metadata } from "next"
import {
  DownloadIcon,
  FilterIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york-v4/ui/tabs"
import { AnalyticsDatePicker } from "@/app/(examples)/dashboard-03/components/analytics-date-picker"
import { ChartRevenue } from "@/app/(examples)/dashboard-03/components/chart-revenue"
import { ChartVisitors } from "@/app/(examples)/dashboard-03/components/chart-visitors"
import { ProductsTable } from "@/app/(examples)/dashboard-03/components/products-table"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "An example dashboard to test the new components.",
}

// Load from database.
const products = [
  {
    id: "1",
    name: "BJÖRKSNÄS Dining Table",
    price: 599.99,
    stock: 12,
    dateAdded: "2023-06-15",
    status: "In Stock",
  },
  {
    id: "2",
    name: "POÄNG Armchair",
    price: 249.99,
    stock: 28,
    dateAdded: "2023-07-22",
    status: "In Stock",
  },
  {
    id: "3",
    name: "MALM Bed Frame",
    price: 399.99,
    stock: 15,
    dateAdded: "2023-08-05",
    status: "In Stock",
  },
  {
    id: "4",
    name: "KALLAX Shelf Unit",
    price: 179.99,
    stock: 32,
    dateAdded: "2023-09-12",
    status: "In Stock",
  },
  {
    id: "5",
    name: "STOCKHOLM Rug",
    price: 299.99,
    stock: 8,
    dateAdded: "2023-10-18",
    status: "Low Stock",
  },
  {
    id: "6",
    name: "KIVIK Sofa",
    price: 899.99,
    stock: 6,
    dateAdded: "2023-11-02",
    status: "Low Stock",
  },
  {
    id: "7",
    name: "LISABO Coffee Table",
    price: 149.99,
    stock: 22,
    dateAdded: "2023-11-29",
    status: "In Stock",
  },
  {
    id: "8",
    name: "HEMNES Bookcase",
    price: 249.99,
    stock: 17,
    dateAdded: "2023-12-10",
    status: "In Stock",
  },
  {
    id: "9",
    name: "EKEDALEN Dining Chairs (Set of 2)",
    price: 199.99,
    stock: 14,
    dateAdded: "2024-01-05",
    status: "In Stock",
  },
  {
    id: "10",
    name: "FRIHETEN Sleeper Sofa",
    price: 799.99,
    stock: 9,
    dateAdded: "2024-01-18",
    status: "Low Stock",
  },
]

export default function DashboardPage() {
  return (
    <div className="@container/page flex flex-1 flex-col gap-8 p-6">
      <Tabs defaultValue="overview" className="gap-6">
        <div
          data-slot="dashboard-header"
          className="flex items-center justify-between"
        >
          <TabsList className="w-full @3xl/page:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="exports" disabled>
              Exports
            </TabsTrigger>
          </TabsList>
          <div className="hidden items-center gap-2 @3xl/page:flex">
            <AnalyticsDatePicker />
            <Button variant="outline">
              <FilterIcon />
              Filter
            </Button>
            <Button variant="outline">
              <DownloadIcon />
              Export
            </Button>
          </div>
        </div>
        <TabsContent value="overview" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>$1,250.00 in the last 30 days</CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="outline">
                  <TrendingUpIcon />
                  +12.5%
                </Badge>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>New Customers</CardTitle>
                <CardDescription>-12 customers from last month</CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="outline">
                  <TrendingDownIcon />
                  -20%
                </Badge>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Accounts</CardTitle>
                <CardDescription>+2,345 users from last month</CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="outline">
                  <TrendingUpIcon />
                  +12.5%
                </Badge>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Growth Rate</CardTitle>
                <CardDescription>+12.5% increase per month</CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="outline">
                  <TrendingUpIcon />
                  +4.5%
                </Badge>
              </CardFooter>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 @4xl/page:grid-cols-[2fr_1fr]">
            <ChartRevenue />
            <ChartVisitors />
          </div>
          <ProductsTable products={products} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

```