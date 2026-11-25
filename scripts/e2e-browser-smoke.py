#!/usr/bin/env python3
"""
Automated Headless Chromium + Playwright E2E Browser Smoke Suite
Boots the built production server (dist/server/server.cjs) against a fresh
disposable SQLite database (NODE_ENV=production, GEMINI_API_KEY="", COOKIE_SECURE=false)
and verifies real DOM rendering, theme/language toggles, catalog filtering,
2-minute major quiz, student registration + bookmark SQLite sync + notifications +
Study Advisor offline chat, and strict cross-student isolation with ZERO console/page errors.
"""

import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from playwright.sync_api import sync_playwright


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_for_health(base_url: str, proc: subprocess.Popen, timeout_sec: int = 30) -> dict:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        if proc.poll() is not None:
            raise RuntimeError(f"Server exited early with code {proc.returncode}")
        try:
            with urllib.request.urlopen(f"{base_url}/api/health", timeout=2) as resp:
                if resp.status == 200:
                    return json.loads(resp.read().decode("utf-8"))
        except Exception:
            time.sleep(0.3)
    raise RuntimeError("Timed out waiting for /api/health")


def main() -> int:
    repo_root = os.getcwd()
    server_entry = os.path.join(repo_root, "dist", "server", "server.cjs")
    if not os.path.exists(server_entry):
        print(f"ERROR: {server_entry} not found. Run `npm run build` first.", file=sys.stderr)
        return 1

    work_dir = tempfile.mkdtemp(prefix="cdes-browser-e2e-")
    db_path = os.path.join(work_dir, "e2e.db")
    port = find_free_port()
    base_url = f"http://127.0.0.1:{port}"

    env = os.environ.copy()
    env.update(
        {
            "NODE_ENV": "production",
            "HOST": "127.0.0.1",
            "PORT": str(port),
            "DATABASE_PATH": db_path,
            "COOKIE_SECURE": "false",
            "GEMINI_API_KEY": "",
            "FRONTEND_ORIGIN": base_url,
            "JWT_SECRET": "e2e-browser-smoke-strong-jwt-secret-0123456789abcdef",
        }
    )

    server_log = open(os.path.join(work_dir, "server.log"), "w", encoding="utf-8")
    proc = subprocess.Popen(
        ["node", server_entry],
        cwd=repo_root,
        env=env,
        stdout=server_log,
        stderr=subprocess.STDOUT,
    )

    checks_passed: list[str] = []
    console_errors: list[str] = []
    page_errors: list[str] = []

    try:
        health = wait_for_health(base_url, proc)
        assert health.get("ready") is True, f"Unhealthy boot: {health}"
        assert health.get("aiEnabled") is False, f"Expected aiEnabled=false: {health}"
        checks_passed.append("prod_server_health_200")

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                executable_path="/usr/bin/google-chrome",
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )

            # ---- Context 1: Guest -> Theme/Lang -> Scholarships -> Universities -> Quiz -> Register Student A ----
            context_a = browser.new_context(viewport={"width": 1366, "height": 900})
            page = context_a.new_page()
            page.on(
                "console",
                lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
            )
            page.on("pageerror", lambda err: page_errors.append(str(err)))

            page.goto(base_url, wait_until="networkidle")
            page.wait_for_selector("header", timeout=15000)
            body_text = page.inner_text("body")
            assert "Research Lab" not in body_text, "Admin-only Research Lab must be hidden from guest"
            assert "Platform Architecture" not in body_text, "Admin-only Platform Architecture must be hidden from guest"
            checks_passed.append("guest_home_loaded_admin_hidden")

            # Theme toggle (Light -> Dark -> Light)
            theme_btn = page.locator("#theme-toggle-btn")
            theme_btn.click()
            page.wait_for_function("() => document.documentElement.classList.contains('dark')")
            page.reload(wait_until="networkidle")
            assert page.evaluate("() => document.documentElement.classList.contains('dark')"), "Dark theme must persist"
            page.locator("#theme-toggle-btn").click()
            page.wait_for_function("() => !document.documentElement.classList.contains('dark')")
            checks_passed.append("dark_light_theme_toggle_persists")

            # Bilingual EN -> KM -> EN toggle
            page.locator("#language-selector-btn").click()
            page.get_by_role("button", name="ភាសាខ្មែរ").click()
            page.wait_for_function("() => document.documentElement.lang === 'km'")
            assert "អាហារូបករណ៍" in page.inner_text("header")
            page.locator("#language-selector-btn").click()
            page.get_by_role("button", name="English").click()
            page.wait_for_function("() => document.documentElement.lang === 'en'")
            checks_passed.append("bilingual_en_km_toggle")

            # Scholarships view + bookmark as guest
            page.locator("header").get_by_role("button", name="Scholarships").click()
            page.wait_for_selector("#scholarship-intelligence-view", timeout=10000)
            page.wait_for_selector("button[aria-label='Bookmark scholarship']", timeout=10000)
            page.locator("button[aria-label='Bookmark scholarship']").first.click()
            page.wait_for_selector("button[aria-label='Remove bookmark']", timeout=5000)
            checks_passed.append("guest_scholarship_catalog_and_bookmark")

            # Universities view hydrated from live SQLite
            page.locator("header").get_by_role("button", name="Universities").click()
            page.wait_for_timeout(600)
            uni_text = page.inner_text("main")
            assert "CADT" in uni_text or "ITC" in uni_text or "RUPP" in uni_text
            checks_passed.append("universities_live_hydration")

            # 2-Minute Major Fit Quiz via Explore dropdown
            page.locator("header").get_by_role("button", name="Explore").click()
            page.locator("header").get_by_role("button", name="2-Min Major Fit Quiz").first.click()
            page.wait_for_timeout(400)
            for _ in range(5):
                next_btn = page.locator("main button").filter(has_text="Next").or_(
                    page.locator("main button").filter(has_text="See My")
                ).or_(
                    page.locator("main button").filter(has_text="Generate")
                ).or_(
                    page.locator("main button").filter(has_text="Continue")
                ).last
                next_btn.click()
                page.wait_for_timeout(250)
            page.wait_for_timeout(800)
            quiz_out = page.inner_text("main")
            assert "Estimate" in quiz_out or "Recommended" in quiz_out or "CADT" in quiz_out
            checks_passed.append("decision_quiz_completed")

            # Register Student A -> verify guest bookmark syncs + welcome notification bell + Study Advisor offline chat
            page.locator("header").get_by_role("button", name="Sign In").click()
            page.get_by_role("dialog").get_by_role("button", name="Register").click()
            page.fill("#auth-name", "Sokha E2E Alpha")
            page.fill("#auth-email", "sokha.e2e@cdes.test")
            page.fill("#auth-password", "StrongStudent!2026")
            page.get_by_role("dialog").get_by_role("button", name="Create Account").click()
            page.wait_for_selector("#notifications-bell-btn", timeout=10000)
            checks_passed.append("student_a_registered_and_logged_in")

            # Check persisted welcome notification in bell menu
            page.locator("#notifications-bell-btn").click()
            page.wait_for_selector("#notifications-dropdown", timeout=5000)
            notif_text = page.locator("#notifications-dropdown").inner_text()
            assert "Welcome to CDES" in notif_text, f"Expected persisted welcome notification, got: {notif_text}"
            page.keyboard.press("Escape")
            checks_passed.append("student_a_persisted_notification_bell")

            # Verify guest bookmark merged into Student A SQLite saved drawer
            page.locator("header").get_by_role("button", name="Scholarships").click()
            page.wait_for_selector("#scholarship-intelligence-view", timeout=10000)
            page.wait_for_timeout(600)
            page.locator("#open-saved-scholarships").click()
            page.wait_for_selector("#scholarship-saved-drawer", timeout=5000)
            drawer_text = page.locator("#scholarship-saved-drawer").inner_text()
            assert "Synced" in drawer_text, f"Expected Synced badge in drawer, got: {drawer_text}"
            assert "1 bookmarked" in drawer_text, f"Expected merged bookmark count, got: {drawer_text}"
            page.keyboard.press("Escape")
            checks_passed.append("student_a_guest_bookmark_synced_to_sqlite")

            # Study Advisor deterministic offline chat
            page.locator("header").get_by_role("button", name="Study Advisor").click()
            advisor_input = page.get_by_label("Ask the Study Advisor")
            advisor_input.fill("Compare Computer Science at CADT vs ITC")
            page.locator("form button[type='submit']").click()
            page.wait_for_timeout(1200)
            adv_text = page.inner_text("main")
            assert "CADT" in adv_text and "ITC" in adv_text
            checks_passed.append("student_a_study_advisor_offline_reply")

            # My Profile & Privacy Center (optional tracking OFF by default)
            page.locator("header").get_by_role("button", name="My Profile").click()
            page.wait_for_timeout(600)
            prof_text = page.inner_text("main")
            assert "Sokha E2E Alpha" in prof_text
            checks_passed.append("student_a_profile_and_privacy_center")
            context_a.close()

            # ---- Context 2: Fresh browser session registers Student B -> verify strict isolation ----
            context_b = browser.new_context(viewport={"width": 1366, "height": 900})
            page_b = context_b.new_page()
            page_b.on(
                "console",
                lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
            )
            page_b.on("pageerror", lambda err: page_errors.append(str(err)))

            page_b.goto(base_url, wait_until="networkidle")
            page_b.locator("header").get_by_role("button", name="Sign In").click()
            page_b.get_by_role("dialog").get_by_role("button", name="Register").click()
            page_b.fill("#auth-name", "Dara E2E Beta")
            page_b.fill("#auth-email", "dara.e2e@cdes.test")
            page_b.fill("#auth-password", "StrongStudent!2026")
            page_b.get_by_role("dialog").get_by_role("button", name="Create Account").click()
            page_b.wait_for_selector("#notifications-bell-btn", timeout=10000)

            page_b.locator("header").get_by_role("button", name="My Profile").click()
            page_b.wait_for_timeout(600)
            prof_b_text = page_b.inner_text("main")
            assert "Dara E2E Beta" in prof_b_text
            assert "Sokha E2E Alpha" not in prof_b_text, "Student A name leaked into Student B UI"
            checks_passed.append("student_b_strict_ui_isolation")

            context_b.close()
            browser.close()

        assert len(console_errors) == 0, f"Browser console errors detected: {console_errors}"
        assert len(page_errors) == 0, f"Uncaught page errors detected: {page_errors}"

        print(
            json.dumps(
                {
                    "status": "PASS",
                    "checksPassed": checks_passed,
                    "consoleErrors": 0,
                    "pageErrors": 0,
                    "schemaVersion": health.get("database", {}).get("schemaVersion"),
                },
                indent=2,
            )
        )
        return 0
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        server_log.close()
        shutil.rmtree(work_dir, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
