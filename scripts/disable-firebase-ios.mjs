#!/usr/bin/env node
/**
 * Disable the Firebase Capacitor plugins on iOS without removing their pods.
 *
 * The client's dependency set includes Firebase plugins (Crashlytics, FCM,
 * Analytics). On iOS those plugins call `FirebaseApp.configure()` the moment
 * Capacitor loads them, which crashes the app unless a real
 * `GoogleService-Info.plist` is present. We want the pods to stay linked (so the
 * build mirrors the client's setup) but Firebase to never initialize.
 *
 * Capacitor 7 loads iOS plugins explicitly from `packageClassList` in
 * `ios/App/App/capacitor.config.json`. Removing the Firebase entries means the
 * bridge never instantiates them, so `FirebaseApp.configure()` is never called
 * and the app runs without a plist. The pods remain in the Podfile, just inert.
 *
 * `npx cap sync` / `cap copy` regenerate that JSON from node_modules and re-add
 * the Firebase plugins, so this script re-applies the filter. It is idempotent.
 *
 * Run automatically via `npm run cap:sync` / `cap:sync:ios` / `cap:copy:ios`,
 * or on its own:  node scripts/disable-firebase-ios.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Resolve relative to this file so it works regardless of the caller's cwd.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONFIG = resolve(ROOT, 'ios/App/App/capacitor.config.json')

// Plugin classes that pull in Firebase and require a configured FirebaseApp
// (i.e. a GoogleService-Info.plist). Matched as a case-insensitive substring so
// future Firebase plugins are covered too.
const FIREBASE_MATCH = /firebase|fcm/i

if (!existsSync(CONFIG)) {
  console.log(`[disable-firebase] ${CONFIG} not found — skipping (run after \`cap sync ios\`).`)
  process.exit(0)
}

const cfg = JSON.parse(readFileSync(CONFIG, 'utf8'))
const before = Array.isArray(cfg.packageClassList) ? cfg.packageClassList : []
const removed = before.filter((c) => FIREBASE_MATCH.test(c))

if (removed.length === 0) {
  console.log('[disable-firebase] no Firebase plugins in packageClassList — already clean.')
  process.exit(0)
}

cfg.packageClassList = before.filter((c) => !FIREBASE_MATCH.test(c))
// Preserve the file's tab indentation + trailing newline.
writeFileSync(CONFIG, JSON.stringify(cfg, null, '\t') + '\n')
console.log(`[disable-firebase] removed ${removed.length} Firebase plugin(s): ${removed.join(', ')}`)
console.log('[disable-firebase] Firebase pods stay linked but are never loaded by Capacitor.')
