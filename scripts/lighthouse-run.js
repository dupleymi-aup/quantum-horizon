import lighthouse from 'lighthouse'
import { chromeLauncher } from 'lighthouse/chrome-launcher'

async function runLighthouse() {
  const url = 'http://localhost:3000'
  
  console.log(`Running Lighthouse on ${url}...`)
  
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port,
  }
  
  const result = await lighthouse(url, options)
  const scores = result.lhr.categories
  
  console.log('\n=== Lighthouse Results ===\n')
  console.log(`Performance: ${Math.round(scores.performance.score * 100)}%`)
  console.log(`Accessibility: ${Math.round(scores.accessibility.score * 100)}%`)
  console.log(`Best Practices: ${Math.round(scores['best-practices'].score * 100)}%`)
  console.log(`SEO: ${Math.round(scores.seo.score * 100)}%`)
  console.log(`PWA: ${Math.round(scores.pwa.score * 100)}%`)
  
  await chrome.kill()
  
  // Save full report
  const fs = await import('fs')
  fs.writeFileSync('./.lighthouseci/report-new.json', JSON.stringify(result.lhr, null, 2))
  console.log('\nFull report saved to .lighthouseci/report-new.json')
}

runLighthouse().catch(console.error)
