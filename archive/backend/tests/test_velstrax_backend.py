"""Velstrax backend API tests.

Covers:
- Root endpoint
- Auth (login, /me, logout, invalid creds)
- Settings (public GET, protected PUT)
- Portfolio CRUD (auth-protected writes)
- Contact form (public POST + Resend) and admin list
- MongoDB _id leak check across all responses
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://elite-web-forge.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@velstrax.com"
ADMIN_PASSWORD = "Velstrax@2026"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["token"]
    # also assert httpOnly cookie was set
    set_cookie = r.headers.get("set-cookie", "").lower()
    assert "access_token" in set_cookie, f"access_token cookie not set: {set_cookie}"
    assert "httponly" in set_cookie
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def _assert_no_mongo_id(payload):
    """Recursively ensure no `_id` field exists."""
    if isinstance(payload, dict):
        assert "_id" not in payload, f"_id leak in dict: {payload}"
        for v in payload.values():
            _assert_no_mongo_id(v)
    elif isinstance(payload, list):
        for item in payload:
            _assert_no_mongo_id(item)


# ---------------- Root ----------------
class TestRoot:
    def test_root_message(self, session):
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("message") == "Velstrax API"


# ---------------- Auth ----------------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "id" in data
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        _assert_no_mongo_id(data)
        # cookie
        set_cookie = r.headers.get("set-cookie", "").lower()
        assert "access_token=" in set_cookie
        assert "httponly" in set_cookie

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=20)
        assert r.status_code == 401

    def test_login_wrong_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "noone@velstrax.com", "password": "x"}, timeout=20)
        assert r.status_code == 401

    def test_me_with_bearer(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "password_hash" not in data
        _assert_no_mongo_id(data)

    def test_me_without_auth(self, session):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_logout_clears_cookie(self, session):
        r = session.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200
        sc = r.headers.get("set-cookie", "").lower()
        # delete_cookie sets the cookie with Max-Age=0 or past expiry
        assert "access_token=" in sc


# ---------------- Settings ----------------
class TestSettings:
    def test_get_settings_public(self, session):
        r = session.get(f"{API}/settings", timeout=15)
        assert r.status_code == 200
        data = r.json()
        for k in ("youtube", "instagram", "tiktok", "email"):
            assert k in data
        _assert_no_mongo_id(data)

    def test_put_settings_no_auth(self, session):
        r = requests.put(f"{API}/settings", json={"youtube": "x", "instagram": "y", "tiktok": "z", "email": "a@b.c"}, timeout=15)
        assert r.status_code == 401

    def test_put_settings_with_auth_persists(self, session, auth_headers):
        new_payload = {
            "youtube": "https://youtube.com/@velstrax-test",
            "instagram": "https://instagram.com/velstrax-test",
            "tiktok": "https://tiktok.com/@velstrax-test",
            "email": "test@velstrax.com",
        }
        r = session.put(f"{API}/settings", json=new_payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        # verify persistence
        g = session.get(f"{API}/settings", timeout=15).json()
        for k, v in new_payload.items():
            assert g[k] == v, f"mismatch on {k}: {g[k]} vs {v}"
        _assert_no_mongo_id(g)

        # restore reasonable defaults
        restore = {
            "youtube": "https://youtube.com/@velstrax",
            "instagram": "https://instagram.com/velstrax",
            "tiktok": "https://tiktok.com/@velstrax",
            "email": "hello@velstrax.com",
        }
        session.put(f"{API}/settings", json=restore, headers=auth_headers, timeout=15)


# ---------------- Portfolio ----------------
class TestPortfolio:
    def test_list_public(self, session):
        r = session.get(f"{API}/portfolio", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 6, f"Expected at least 6 seeded items, got {len(items)}"
        # sorted by order ascending
        orders = [i.get("order", 0) for i in items]
        assert orders == sorted(orders), f"items not sorted by order: {orders}"
        _assert_no_mongo_id(items)

    def test_create_requires_auth(self, session):
        r = requests.post(f"{API}/portfolio", json={"title": "X", "category": "C", "description": "D", "image_url": "u"}, timeout=15)
        assert r.status_code == 401

    def test_crud_flow(self, session, auth_headers):
        create_payload = {
            "title": "TEST_Velstrax_Item",
            "category": "TestCat",
            "description": "Test desc",
            "image_url": "https://example.com/img.jpg",
            "metric_before": "0",
            "metric_after": "100",
            "tags": ["a", "b"],
            "order": 99,
        }
        r = session.post(f"{API}/portfolio", json=create_payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        item = r.json()
        assert item["title"] == create_payload["title"]
        assert "id" in item and len(item["id"]) >= 8
        _assert_no_mongo_id(item)
        item_id = item["id"]

        # verify GET reflects new item
        listing = session.get(f"{API}/portfolio", timeout=15).json()
        ids = [x["id"] for x in listing]
        assert item_id in ids

        # update
        upd = session.put(f"{API}/portfolio/{item_id}", json={"title": "TEST_Velstrax_Updated"}, headers=auth_headers, timeout=15)
        assert upd.status_code == 200, upd.text
        assert upd.json()["title"] == "TEST_Velstrax_Updated"

        # update unauthenticated fails
        bad = requests.put(f"{API}/portfolio/{item_id}", json={"title": "x"}, timeout=15)
        assert bad.status_code == 401

        # delete unauthenticated fails
        bad_del = requests.delete(f"{API}/portfolio/{item_id}", timeout=15)
        assert bad_del.status_code == 401

        # delete
        d = session.delete(f"{API}/portfolio/{item_id}", headers=auth_headers, timeout=15)
        assert d.status_code == 200

        # verify gone — re-list and check id absent
        listing2 = session.get(f"{API}/portfolio", timeout=15).json()
        assert item_id not in [x["id"] for x in listing2]

        # 404 on update of deleted
        nf = session.put(f"{API}/portfolio/{item_id}", json={"title": "x"}, headers=auth_headers, timeout=15)
        assert nf.status_code == 404


# ---------------- Contact ----------------
class TestContact:
    def test_submit_valid(self, session):
        payload = {
            "name": "TEST Tester",
            "email": "tester@example.com",
            "company": "TEST Co",
            "message": "This is a test inquiry from automated tests.",
            "budget": "€5k-€10k",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("message") == "Contact submitted"
        assert "email_sent" in data
        # NOTE: email_sent may be False in Resend test mode if recipient not verified — that's acceptable.

    def test_invalid_email(self, session):
        r = session.post(f"{API}/contact", json={"name": "x", "email": "not-an-email", "message": "hi"}, timeout=15)
        assert r.status_code == 422

    def test_contacts_list_requires_auth(self, session):
        r = requests.get(f"{API}/contacts", timeout=15)
        assert r.status_code == 401

    def test_contacts_list_with_auth(self, session, auth_headers):
        r = session.get(f"{API}/contacts", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 1
        _assert_no_mongo_id(items)
        # latest first by created_at
        emails = [i.get("email") for i in items]
        assert "tester@example.com" in emails
