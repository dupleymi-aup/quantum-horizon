import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help & Documentation — Quantum Horizon",
  description: "Learn how to use Quantum Horizon — visualizations, XP system, quizzes, and keyboard shortcuts.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
      <div className="space-y-3 text-sm text-gray-300">{children}</div>
    </section>
  )
}

function Shortcut({ keys, description }: { keys: string; description: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-800/50 px-4 py-2">
      <span className="text-gray-300">{description}</span>
      <kbd className="rounded bg-gray-700 px-2 py-1 font-mono text-xs text-cyan-300">{keys}</kbd>
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Help & Documentation</h1>
        <p className="mt-2 text-gray-400">
          Everything you need to know about Quantum Horizon.
        </p>
      </div>

      <Section title="Getting Started">
        <p>
          Quantum Horizon is an interactive platform for learning modern physics. Browse through 36
          visualizations covering quantum mechanics, relativity, cosmology, and more.
        </p>
        <ol className="ml-4 list-decimal space-y-2">
          <li>Choose a visualization from the main page</li>
          <li>Interact with sliders, buttons, and canvas controls</li>
          <li>Read the physics explanation in the info panel</li>
          <li>Complete quizzes and practice problems to earn XP</li>
          <li>Track your progress on the dashboard and profile pages</li>
        </ol>
      </Section>

      <Section title="Using Visualizations">
        <p>Each visualization includes:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong>Interactive canvas</strong> — drag, click, and adjust parameters in real time</li>
          <li><strong>Controls</strong> — sliders and buttons to change physical quantities</li>
          <li><strong>Info panel</strong> — explanation of the physics phenomenon</li>
          <li><strong>Learning mode</strong> — guided walkthrough with step-by-step explanations</li>
          <li><strong>Formula calculator</strong> — compute values using physics formulas</li>
          <li><strong>Presets</strong> — save and share your favorite configurations</li>
          <li><strong>Split-screen</strong> — compare two visualizations side by side</li>
        </ul>
      </Section>

      <Section title="XP & Achievements">
        <p>Earn experience points (XP) by engaging with the platform:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong>View a visualization</strong> — 5 XP</li>
          <li><strong>Complete a quiz</strong> — 10 XP (+ bonus for perfect score)</li>
          <li><strong>Unlock an achievement</strong> — 10 XP</li>
          <li><strong>Study sessions</strong> — 1 XP per 10 minutes</li>
          <li><strong>Create a preset</strong> — 5 XP</li>
        </ul>
        <p className="mt-2">
          There are 20 achievements across 4 categories: Learning, Exploration, Mastery, and
          Dedication. Achievement rarity ranges from Common to Legendary.
        </p>
      </Section>

      <Section title="Quiz System">
        <p>
          Each visualization has a quiz available in 4 languages (Russian, English, Chinese,
          Hebrew). Questions test your understanding of the underlying physics.
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Complete quizzes to earn XP and unlock achievements</li>
          <li>Your grades are recorded and visible to administrators</li>
          <li>Topics where you score below 60% will be recommended for review</li>
        </ul>
      </Section>

      <Section title="Keyboard Shortcuts">
        <div className="space-y-2">
          <Shortcut keys="Space" description="Play/pause animation" />
          <Shortcut keys="1-5" description="Quick-switch between sections" />
          <Shortcut keys="K" description="Open command palette / search" />
          <Shortcut keys="H" description="Show keyboard shortcuts help" />
          <Shortcut keys="F" description="Toggle fullscreen" />
          <Shortcut keys="Esc" description="Close dialog / exit fullscreen" />
        </div>
      </Section>

      <Section title="FAQ">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-white">Is Quantum Horizon free?</h3>
            <p>Yes, all visualizations and learning materials are completely free.</p>
          </div>
          <div>
            <h3 className="font-medium text-white">Can I use this offline?</h3>
            <p>
              Some features work offline. The app has a service worker that caches visualizations
              for offline use.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white">What languages are supported?</h3>
            <p>
              The interface is available in Russian, English, Chinese (Simplified), and Hebrew.
              Educational content (quizzes, biographies) is translated into all 4 languages.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white">How do I change the language?</h3>
            <p>
              Go to Settings (gear icon) and select your preferred language from the Language dropdown.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white">Can I track my learning progress?</h3>
            <p>
              Yes. Your progress, quiz scores, and achievements are saved to your account. View them
              on the Dashboard and Profile pages.
            </p>
          </div>
        </div>
      </Section>

      <div className="rounded-xl border border-purple-500/20 bg-purple-900/20 p-4 text-center text-sm text-gray-400">
        Have a question not covered here? Contact us or open an issue on{" "}
        <a
          href="https://github.com/quantum-horizon"
          className="text-purple-400 underline hover:text-purple-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </div>
    </div>
  )
}
