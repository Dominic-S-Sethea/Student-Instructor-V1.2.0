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
            page.wait_for_selector("#left-sidebar-nav", timeout=15000)
            sidebar = page.locator("#left-sidebar-nav")
            body_text = page.inner_text("body")
            assert "Research Lab" not in body_text, "Admin-only Research Lab must be hidden from guest"
            assert "Platform Architecture" not in body_text, "Admin-only Platform Architecture must be hidden from guest"
            # Verify Home Master Header dropdown reveals expected sub-headers
            assert "Explore Verified Scholarships" in sidebar.inner_text()
            assert "2-Minute Major Fit Quiz" in sidebar.inner_text()
            checks_passed.append("guest_home_loaded_admin_hidden")

            # Verify sidebar collapse-to-icons toggle and expand
            expanded_box = sidebar.bounding_box()
            assert expanded_box and expanded_box["width"] >= 240, f"Expected expanded sidebar, got {expanded_box}"
            page.locator("#sidebar-collapse-btn").click()
            page.wait_for_timeout(300)
            collapsed_box = sidebar.bounding_box()
            assert collapsed_box and collapsed_box["width"] <= 90, f"Expected collapsed icon rail, got {collapsed_box}"
            page.locator("#sidebar-collapse-btn").click()
            page.wait_for_timeout(300)
            checks_passed.append("left_sidebar_collapse_expand")

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
            assert "អាហារូបករណ៍" in sidebar.inner_text()
            page.locator("#language-selector-btn").click()
            page.get_by_role("button", name="English").click()
            page.wait_for_function("() => document.documentElement.lang === 'en'")
            checks_passed.append("bilingual_en_km_toggle")

            # Helper: verify 0 visible text-bearing elements have computed user-select: none
            def assert_all_text_selectable(target_page, label: str) -> None:
                blocked = target_page.evaluate(
                    """() => {
                        const bad = [];
                        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                        let node;
                        while ((node = walker.nextNode())) {
                            if (!node.textContent || !node.textContent.trim()) continue;
                            const el = node.parentElement;
                            if (!el) continue;
                            const rect = el.getBoundingClientRect();
                            if (rect.width === 0 || rect.height === 0) continue;
                            const style = window.getComputedStyle(el);
                            if (style.visibility === 'hidden' || style.display === 'none') continue;
                            if (style.userSelect === 'none' || style.webkitUserSelect === 'none') {
                                bad.push({ tag: el.tagName, text: node.textContent.trim().slice(0, 40) });
                            }
                        }
                        return bad;
                    }"""
                )
                assert len(blocked) == 0, f"Found non-selectable text in {label}: {blocked[:5]}"

            assert_all_text_selectable(page, "dashboard")

            # Scholarships Master Header + sub-header deep navigation + bookmark as guest
            sidebar.get_by_role("button", name="Scholarships", exact=True).click()
            page.wait_for_selector("#scholarship-intelligence-view", timeout=10000)
            page.wait_for_selector("button[aria-label='Bookmark scholarship']", timeout=10000)
            assert_all_text_selectable(page, "scholarships-flagship")
            page.locator("button[aria-label='Bookmark scholarship']").first.click()
            page.wait_for_selector("button[aria-label='Remove bookmark']", timeout=5000)
            # Sub-header switches directly to Top 100 Global Aid
            sidebar.get_by_role("button", name="Top 100 Global Aid").click()
            page.wait_for_timeout(500)
            assert page.locator('img[src*="/crests/"]').count() > 0, "Top 100 Global Aid sub-header must open crests directory"
            assert_all_text_selectable(page, "scholarships-top100")

            # Drag-select a Top 100 university card heading and verify modal does NOT accidentally open
            first_card_h3 = page.locator("main h3").first
            h3_box = first_card_h3.bounding_box()
            assert h3_box and h3_box["width"] > 20, f"Expected visible card heading box, got {h3_box}"
            page.mouse.move(h3_box["x"] + 2, h3_box["y"] + h3_box["height"] / 2)
            page.mouse.down()
            page.mouse.move(h3_box["x"] + min(h3_box["width"] - 2, 160), h3_box["y"] + h3_box["height"] / 2, steps=8)
            page.mouse.up()
            page.wait_for_timeout(200)
            selected_top100 = page.evaluate("() => (window.getSelection() || '').toString().trim()")
            assert len(selected_top100) >= 3, f"Expected drag-selected text on Top 100 card, got {selected_top100!r}"
            assert page.locator('[role="dialog"]').count() == 0, "Drag-selecting text on a card must NOT open the dossier modal"
            checks_passed.append("guest_scholarship_catalog_and_bookmark")
            checks_passed.append("top100_card_text_selectable_without_modal")

            # Universities Master Header + Comparison Matrix text selectability
            sidebar.get_by_role("button", name="Universities", exact=True).click()
            page.wait_for_timeout(600)
            uni_text = page.inner_text("main")
            assert "CADT" in uni_text or "ITC" in uni_text or "RUPP" in uni_text
            assert_all_text_selectable(page, "universities-profiles")
            sidebar.get_by_role("button", name="Compare Matrix").click()
            page.wait_for_timeout(500)
            assert_all_text_selectable(page, "universities-compare-matrix")
            # Drag-select a matrix row label inside useDraggableScroll container
            matrix_cell = page.locator("main").get_by_text("Data Reliability").first
            mc_box = matrix_cell.bounding_box()
            assert mc_box and mc_box["width"] > 20
            page.mouse.move(mc_box["x"] + 2, mc_box["y"] + mc_box["height"] / 2)
            page.mouse.down()
            page.mouse.move(mc_box["x"] + min(mc_box["width"] - 2, 120), mc_box["y"] + mc_box["height"] / 2, steps=6)
            page.mouse.up()
            selected_matrix = page.evaluate("() => (window.getSelection() || '').toString().trim()")
            assert len(selected_matrix) >= 3, f"Expected drag-selected text in Comparison Matrix, got {selected_matrix!r}"
            checks_passed.append("universities_live_hydration_and_selectable")

            # 2-Minute Major Fit Quiz via Home Master Header dropdown
            sidebar.get_by_role("button", name="Home", exact=True).click()
            page.wait_for_timeout(250)
            sidebar.get_by_role("button", name="2-Minute Major Fit Quiz").click()
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

            # Register Student A -> verify guest bookmark syncs + welcome notification bell + Settings SQLite sync
            sidebar.get_by_role("button", name="Sign In").click()
            page.get_by_role("dialog").get_by_role("button", name="Register").click()
            page.fill("#auth-name", "Sokha E2E Alpha")
            page.fill("#auth-email", "sokha.e2e@cdes.test")
            page.fill("#auth-password", "StrongStudent!2026")
            page.get_by_role("dialog").get_by_role("button", name="Create Account").click()
            page.wait_for_selector("#notifications-bell-btn", timeout=10000)
            checks_passed.append("student_a_registered_and_logged_in")

            # Open Settings panel via 1-click sidebar gear button, adjust Widescreen + Accent + Font + Scale, verify sync + reload persistence
            page.locator("#sidebar-settings-btn").click()
            page.wait_for_selector("#settings-panel-root", timeout=10000)
            assert_all_text_selectable(page, "settings-panel")
            page.locator('[data-setting-accent="emerald"]').click()
            page.locator('[data-setting-layout="full"]').click()
            page.locator('[data-setting-font="serif"]').click()
            page.locator('[data-setting-scale="lg"]').click()
            page.wait_for_function(
                """() => document.documentElement.dataset.accent === 'emerald'
                    && document.documentElement.dataset.layout === 'full'
                    && document.documentElement.dataset.font === 'serif'
                    && document.documentElement.dataset.fontScale === 'lg'"""
            )
            page.wait_for_timeout(600)
            page.reload(wait_until="networkidle")
            page.wait_for_selector("#settings-panel-root", timeout=10000)
            assert page.evaluate(
                """() => document.documentElement.dataset.accent === 'emerald'
                    && document.documentElement.dataset.layout === 'full'
                    && document.documentElement.dataset.font === 'serif'
                    && document.documentElement.dataset.fontScale === 'lg'"""
            ), "Settings (accent/widescreen/font/scale) must persist after reload and server sync"
            checks_passed.append("student_a_settings_panel_and_sqlite_sync")

            # Check persisted welcome notification in bell menu
            page.locator("#notifications-bell-btn").click()
            page.wait_for_selector("#notifications-dropdown", timeout=5000)
            notif_text = page.locator("#notifications-dropdown").inner_text()
            assert "Welcome to CDES" in notif_text, f"Expected persisted welcome notification, got: {notif_text}"
            page.keyboard.press("Escape")
            checks_passed.append("student_a_persisted_notification_bell")

            # Verify guest bookmark merged into Student A SQLite saved drawer
            sidebar.get_by_role("button", name="Scholarships", exact=True).click()
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
            sidebar.get_by_role("button", name="Study Advisor", exact=True).click()
            advisor_input = page.get_by_label("Ask the Study Advisor")
            advisor_input.fill("Compare Computer Science at CADT vs ITC")
            page.locator("form button[type='submit']").click()
            page.wait_for_timeout(1200)
            adv_text = page.inner_text("main")
            assert "CADT" in adv_text and "ITC" in adv_text
            assert_all_text_selectable(page, "advisor")
            checks_passed.append("student_a_study_advisor_offline_reply")

            # My Profile & Privacy Center (optional tracking OFF by default)
            sidebar.get_by_role("button", name="My Profile", exact=True).click()
            page.wait_for_timeout(600)
            prof_text = page.inner_text("main")
            assert "Sokha E2E Alpha" in prof_text
            assert_all_text_selectable(page, "profile")
            checks_passed.append("student_a_profile_and_privacy_center")
            context_a.close()

            # ---- Context 2: Fresh browser session registers Student B -> verify strict isolation (profile + settings) ----
            context_b = browser.new_context(viewport={"width": 1366, "height": 900})
            page_b = context_b.new_page()
            page_b.on(
                "console",
                lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
            )
            page_b.on("pageerror", lambda err: page_errors.append(str(err)))

            page_b.goto(base_url, wait_until="networkidle")
            sidebar_b = page_b.locator("#left-sidebar-nav")
            sidebar_b.get_by_role("button", name="Sign In").click()
            page_b.get_by_role("dialog").get_by_role("button", name="Register").click()
            page_b.fill("#auth-name", "Dara E2E Beta")
            page_b.fill("#auth-email", "dara.e2e@cdes.test")
            page_b.fill("#auth-password", "StrongStudent!2026")
            page_b.get_by_role("dialog").get_by_role("button", name="Create Account").click()
            page_b.wait_for_selector("#notifications-bell-btn", timeout=10000)

            sidebar_b.get_by_role("button", name="My Profile", exact=True).click()
            page_b.wait_for_timeout(600)
            prof_b_text = page_b.inner_text("main")
            assert "Dara E2E Beta" in prof_b_text
            assert "Sokha E2E Alpha" not in prof_b_text, "Student A name leaked into Student B UI"
            # Verify Student B has default settings (NOT Student A's emerald/full/serif)
            page_b.locator("#sidebar-settings-btn").click()
            page_b.wait_for_selector("#settings-panel-root", timeout=10000)
            assert page_b.evaluate(
                """() => document.documentElement.dataset.accent === 'blue'
                    && document.documentElement.dataset.layout === 'standard'
                    && document.documentElement.dataset.font === 'jakarta'"""
            ), "Student A settings leaked into Student B!"
            checks_passed.append("student_b_strict_ui_and_settings_isolation")

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
