import Link from 'next/link';
import { ArrowRight, Leaf, ShieldCheck, Link2, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const chainSteps = [
  { label: 'Buyer commits', hash: '7f3a…c19e', icon: Wallet },
  { label: 'Stellar ledger records', hash: '9e02…44b1', icon: Link2 },
  { label: 'Farmer verifies', hash: 'a1d5…7f0c', icon: ShieldCheck },
  { label: 'Payment released', hash: 'c88e…10aa', icon: Leaf },
];

const features = [
  {
    title: 'Payment Commitments',
    description: 'Every purchase becomes a Stellar Testnet transaction the moment a buyer commits to pay.',
    icon: Link2,
  },
  {
    title: 'Escrow Simulation',
    description: 'Funds lock on commitment and release only after delivery is confirmed by the buyer.',
    icon: ShieldCheck,
  },
  {
    title: 'Auto-Funded Wallets',
    description: 'Every farmer, buyer, and cooperative gets a Stellar wallet, funded instantly via Friendbot.',
    icon: Wallet,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <nav className="border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <Leaf className="h-5 w-5 text-primary" />
            TaniChain
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="ledger-chip mb-6">Built on Stellar Testnet</span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Every harvest payment,
            <br />
            <span className="text-primary">verifiable on-chain.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-muted-foreground">
            TaniChain replaces manual payment verification between farmers and buyers with
            transparent, escrow-backed settlement recorded on the Stellar network.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Create your wallet <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">I already have an account</Button>
            </Link>
          </div>
        </div>

        {/* Signature element: the settlement chain */}
        <div className="mx-auto mt-20 max-w-4xl">
          <div className="glass-panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            {chainSteps.map((step, i) => (
              <div key={step.label} className="flex flex-1 items-center gap-3">
                <div className="flex flex-col items-center gap-2 text-center md:flex-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-foreground">{step.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{step.hash}</p>
                </div>
                {i < chainSteps.length - 1 && (
                  <div className="hidden h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="animate-fade-in">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
