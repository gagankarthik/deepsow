"use client";

import Link from "next/link";
import {
  FileSearch,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Upload,
  Brain,
  Target,
  TrendingUp,
  Users,
  Clock,
  FileText,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Play,
  Star,
  Building2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white !ml-0">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight">DeepSOW</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-sm font-medium" asChild>
                <Link href="/dashboard">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-sm font-medium shadow-lg shadow-indigo-500/25" asChild>
                <Link href="/dashboard">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 px-4 py-1.5 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Powered by Advanced AI
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] animate-fade-in-up">
              Transform Your
              <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                SOW Management
              </span>
            </h1>

            <p className="mt-8 text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Automatically extract, track, and ensure delivery of every commitment in your Statement of Work documents.
              <span className="text-gray-900 font-medium"> Stop leaving money on the table.</span>
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
              <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-500/30 group" asChild>
                <Link href="/upload">
                  Start Analyzing Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-gray-300 hover:bg-gray-50 group">
                <Play className="mr-2 w-5 h-5 text-indigo-600" />
                Watch Demo
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 animate-fade-in-up animation-delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Enterprise-grade security</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-20 relative animate-fade-in-up animation-delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative mx-auto max-w-6xl">
              <div className="bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/20 p-2 ring-1 ring-gray-800">
                <div className="flex items-center gap-1.5 px-3 py-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                  <div className="p-8 space-y-6">
                    {/* Mock Dashboard */}
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "Active SOWs", value: "24", color: "bg-indigo-100", iconColor: "text-indigo-600" },
                        { label: "Total Value", value: "$2.4M", color: "bg-green-100", iconColor: "text-green-600" },
                        { label: "At Risk", value: "3", color: "bg-amber-100", iconColor: "text-amber-600" },
                        { label: "Compliance", value: "94%", color: "bg-violet-100", iconColor: "text-violet-600" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                            <FileText className={`w-5 h-5 ${stat.iconColor}`} />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-40" />
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
            Trusted by innovative teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
            {["Accenture", "Deloitte", "McKinsey", "KPMG", "PwC", "EY"].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-300 hover:text-gray-400 transition-colors cursor-default">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-red-100 text-red-700 hover:bg-red-100 border-0">
                The Problem
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                SOW chaos is costing you
                <span className="text-red-600"> millions</span>
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Most organizations have no visibility into their Statement of Work commitments. Critical deliverables get missed, budgets overrun, and compliance risks go unnoticed until it's too late.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  { icon: FileText, text: "SOWs scattered across emails, PDFs, and shared drives" },
                  { icon: Clock, text: "Hours wasted manually extracting contract data" },
                  { icon: AlertTriangle, text: "No tracking between what was sold vs. delivered" },
                  { icon: DollarSign, text: "Revenue leakage from undelivered services" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-gray-700 pt-2">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl" />
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-red-600">$847K</div>
                  <div className="text-gray-500 mt-2">Average annual loss per enterprise from SOW mismanagement</div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-gray-900">67%</div>
                    <div className="text-sm text-gray-500 mt-1">of SOWs have missed deliverables</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-gray-900">23hrs</div>
                    <div className="text-sm text-gray-500 mt-1">average time to review one SOW</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge className="mb-6 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 border-0">
              Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Everything you need for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                complete SOW visibility
              </span>
            </h2>
            <p className="mt-6 text-lg text-gray-400">
              DeepSOW combines advanced AI with intuitive workflows to give you complete control over your contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Parsing",
                description: "Upload any SOW format and our AI extracts parties, deliverables, milestones, pricing, and key clauses automatically.",
                gradient: "from-violet-500 to-purple-600"
              },
              {
                icon: Target,
                title: "Commitment Tracking",
                description: "Every promise in your SOW becomes a trackable commitment. Never lose sight of what was agreed upon.",
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: BarChart3,
                title: "Unified Dashboard",
                description: "See all your SOWs in one place with real-time metrics on value, compliance, and delivery status.",
                gradient: "from-indigo-500 to-blue-600"
              },
              {
                icon: TrendingUp,
                title: "Spend Analytics",
                description: "Compare actual spend against SOW budgets with visual breakdowns and variance alerts.",
                gradient: "from-emerald-500 to-teal-600"
              },
              {
                icon: Shield,
                title: "Compliance Alerts",
                description: "Get notified when deliverables are overdue, spend exceeds thresholds, or clauses are triggered.",
                gradient: "from-amber-500 to-orange-600"
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Invite your team with role-based permissions. Attach evidence and notes to specific commitments.",
                gradient: "from-pink-500 to-rose-600"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">
              How It Works
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              From document to insight
              <span className="block text-indigo-600">in minutes, not hours</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload Your SOW",
                description: "Drag and drop your SOW documents in PDF, DOCX, or any common format. Our system handles the rest."
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Extraction",
                description: "Our AI reads every line, extracting deliverables, dates, prices, and compliance requirements automatically."
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Track & Manage",
                description: "Monitor commitments on your dashboard, receive alerts, and ensure nothing falls through the cracks."
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent z-0" />
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-xl shadow-gray-100 border border-gray-100 hover:shadow-2xl transition-shadow">
                  <div className="text-6xl font-bold text-indigo-100 mb-4">{item.step}</div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">
              Testimonials
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Loved by teams
              <span className="block text-indigo-600">who demand more</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "DeepSOW cut our contract review time by 85%. What used to take days now takes minutes. The ROI was immediate.",
                author: "Sarah Chen",
                role: "VP of Procurement",
                company: "Fortune 500 Tech Co.",
                avatar: "SC"
              },
              {
                quote: "We discovered $2.3M in undelivered services in our first month. DeepSOW paid for itself 100x over.",
                author: "Michael Torres",
                role: "Director of Operations",
                company: "Global Consulting Firm",
                avatar: "MT"
              },
              {
                quote: "Finally, a single source of truth for all our SOWs. The compliance alerts alone have saved us from multiple disputes.",
                author: "Jennifer Park",
                role: "General Counsel",
                company: "Enterprise SaaS",
                avatar: "JP"
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-8">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-gray-400">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">
              Pricing
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Simple, transparent
              <span className="block text-indigo-600">pricing for every team</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "forever",
                description: "Perfect for small teams getting started",
                features: ["5 SOW documents", "Basic AI extraction", "Email support", "1 team member"],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Professional",
                price: "$199",
                period: "per month",
                description: "For growing teams with serious needs",
                features: ["Unlimited SOWs", "Advanced AI + Compliance", "Priority support", "10 team members", "API access", "Custom integrations"],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "contact us",
                description: "For organizations with complex requirements",
                features: ["Everything in Pro", "Unlimited team members", "SSO / SAML", "Dedicated success manager", "Custom AI training", "On-premise option"],
                cta: "Contact Sales",
                popular: false
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/30 scale-105 lg:scale-110"
                    : "bg-white border border-gray-200 shadow-lg hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400 border-0 px-4">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    <span className={plan.popular ? "text-indigo-200" : "text-gray-500"}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${plan.popular ? "text-indigo-200" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.popular ? "text-indigo-200" : "text-indigo-600"}`} />
                      <span className={plan.popular ? "text-indigo-100" : "text-gray-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full h-12 ${
                    plan.popular
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                  }`}
                  asChild
                >
                  <Link href="/dashboard">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Ready to transform your
            <span className="block">SOW management?</span>
          </h2>
          <p className="mt-6 text-xl text-indigo-100 max-w-2xl mx-auto">
            Join thousands of teams who've already recovered millions in missed deliverables and compliance gaps.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-base bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl group" asChild>
              <Link href="/upload">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-indigo-200">
            No credit card required. Start analyzing in under 2 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-gray-800">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <FileSearch className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-white">DeepSOW</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                The AI-powered platform that transforms how enterprises manage Statement of Work commitments.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-0">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                  All systems operational
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                {["Features", "Pricing", "Security", "Enterprise", "Changelog"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                {["Documentation", "API Reference", "Blog", "Case Studies", "Webinars"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {["About", "Careers", "Contact", "Partners", "Legal"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">
              © 2025 DeepSOW. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
