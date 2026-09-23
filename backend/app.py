from __future__ import annotations

import json
import os
import re
import threading
import time
import uuid
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
SEED_PATH = BASE_DIR / "data" / "seed.json"

load_dotenv(BASE_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://kzmczlhfmrhhxopzpmze.supabase.co").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()
PORT = int(os.getenv("PORT", "10000"))
CACHE_TTL = int(os.getenv("PUBLIC_CACHE_SECONDS", "60"))
CONTACT_LIMIT_PER_HOUR = int(os.getenv("CONTACT_LIMIT_PER_HOUR", "5"))
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "6"))

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024

allowed_origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "").split(",") if x.strip()]
if allowed_origins:
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

PUBLIC_TABLES = {
    "skills": "portfolio_skills",
    "education": "portfolio_education",
    "experiences": "portfolio_experiences",
    "projects": "portfolio_projects",
    "case_studies": "portfolio_case_studies",
}
ADMIN_RESOURCES = {
    "projects": "portfolio_projects",
    "experiences": "portfolio_experiences",
}

_public_cache: dict[str, Any] = {"value": None, "ts": 0.0}
_cache_lock = threading.Lock()
_contact_hits: dict[str, list[float]] = {}
_contact_lock = threading.Lock()


def configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_ANON_KEY)


def load_seed() -> dict[str, Any]:
    with SEED_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def sb_headers(token: str | None = None, *, json_body: bool = True, prefer: str | None = None) -> dict[str, str]:
    headers = {"apikey": SUPABASE_ANON_KEY}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    else:
        headers["Authorization"] = f"Bearer {SUPABASE_ANON_KEY}"
    if json_body:
        headers["Content-Type"] = "application/json"
    if prefer:
        headers["Prefer"] = prefer
    return headers


def sb_rest(
    table: str,
    *,
    method: str = "GET",
    params: dict[str, Any] | None = None,
    body: Any = None,
    token: str | None = None,
    prefer: str | None = None,
    timeout: int = 12,
) -> Any:
    if not configured():
        raise RuntimeError("Supabase no está configurado: falta SUPABASE_ANON_KEY")
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    response = requests.request(
        method,
        url,
        headers=sb_headers(token, prefer=prefer),
        params=params,
        json=body,
        timeout=timeout,
    )
    if response.status_code >= 400:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        raise RuntimeError(f"Supabase {response.status_code}: {detail}")
    if not response.content:
        return None
    if "application/json" in response.headers.get("content-type", ""):
        return response.json()
    return response.text


def bearer_token() -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return ""
    return auth.split(" ", 1)[1].strip()


def get_user(token: str) -> dict[str, Any]:
    if not token:
        raise PermissionError("Falta token de acceso")
    response = requests.get(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"},
        timeout=10,
    )
    if response.status_code != 200:
        raise PermissionError("Sesión inválida o vencida")
    return response.json()


def require_admin() -> tuple[str, dict[str, Any]]:
    token = bearer_token()
    user = get_user(token)
    rows = sb_rest(
        "portfolio_admins",
        params={"select": "user_id", "user_id": f"eq.{user['id']}", "limit": "1"},
        token=token,
    )
    if not rows:
        raise PermissionError("El usuario no está autorizado como administrador")
    return token, user


def clear_public_cache() -> None:
    with _cache_lock:
        _public_cache["value"] = None
        _public_cache["ts"] = 0.0


def get_public_bootstrap() -> dict[str, Any]:
    now = time.time()
    with _cache_lock:
        if _public_cache["value"] is not None and (now - _public_cache["ts"]) < CACHE_TTL:
            return _public_cache["value"]

    if not configured():
        out = load_seed()
        out["_meta"] = {"source": "local-seed", "supabase": False}
        return out

    try:
        profile_rows = sb_rest("portfolio_profile", params={"select": "*", "id": "eq.main", "limit": "1"})
        out: dict[str, Any] = {"profile": profile_rows[0] if profile_rows else {}}
        for key, table in PUBLIC_TABLES.items():
            params: dict[str, str] = {"select": "*"}
            if key in {"projects", "case_studies"}:
                params["published"] = "eq.true"
            if key in {"skills", "education", "experiences", "projects"}:
                params["order"] = "sort_order.asc"
            out[key] = sb_rest(table, params=params)
        out["_meta"] = {"source": "supabase", "supabase": True}
        with _cache_lock:
            _public_cache["value"] = out
            _public_cache["ts"] = now
        return out
    except Exception as exc:
        app.logger.warning("Public bootstrap fell back to seed: %s", exc)
        out = load_seed()
        out["_meta"] = {"source": "local-seed", "supabase": False, "warning": str(exc)}
        return out


def clean_payload(resource: str, payload: dict[str, Any]) -> dict[str, Any]:
    if resource == "projects":
        allowed = {
            "slug", "title_es", "title_en", "subtitle_es", "subtitle_en",
            "description_es", "description_en", "category", "tags", "featured",
            "published", "sort_order", "image_url", "project_url", "github_url",
        }
    elif resource == "experiences":
        allowed = {
            "organization", "role_es", "role_en", "location", "start_date", "end_date",
            "category", "summary_es", "summary_en", "sort_order", "published",
        }
    else:
        allowed = set()
    cleaned = {k: v for k, v in payload.items() if k in allowed}
    if resource == "projects" and not cleaned.get("slug"):
        title = cleaned.get("title_en") or cleaned.get("title_es") or "project"
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or "project"
        cleaned["slug"] = f"{slug}-{uuid.uuid4().hex[:6]}"
    return cleaned


def client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def contact_rate_allowed(ip: str) -> bool:
    now = time.time()
    cutoff = now - 3600
    with _contact_lock:
        hits = [ts for ts in _contact_hits.get(ip, []) if ts > cutoff]
        if len(hits) >= CONTACT_LIMIT_PER_HOUR:
            _contact_hits[ip] = hits
            return False
        hits.append(now)
        _contact_hits[ip] = hits
        return True


@app.after_request
def static_cache_policy(response):
    # HTML/JS/CSS must refresh immediately after a deploy. Images can remain cached.
    path = request.path.lower()
    if path in {"/", "/index.html", "/admin.html"} or path.endswith((".js", ".css", ".json")):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "version": "1.1.4", "supabase_configured": configured()})


@app.get("/api/public/bootstrap")
def public_bootstrap():
    return jsonify(get_public_bootstrap())


@app.get("/api/media-check")
def media_check():
    critical = [
        "assets/img/willer-profile-formal.jpg",
        "assets/img/willer-profile-source.jpg",
        "assets/thesis/infiltrability_map.jpeg",
        "assets/thesis/soil_units_validated_map.jpeg",
        "assets/thesis/location_map.png",
        "assets/thesis/sampling_points_map.jpeg",
        "assets/thesis/area_distribution.png",
        "assets/thesis/basic_infiltration_ranges.png",
        "assets/thesis/irrigation_time_by_class.png",
        "assets/thesis/accumulated_infiltration_5h.png",
    ]
    status = {}
    for rel in critical:
        p = FRONTEND_DIR / rel
        status[rel] = {"exists": p.is_file(), "bytes": p.stat().st_size if p.is_file() else 0}
    return jsonify({"ok": all(x["exists"] for x in status.values()), "version": "1.1.4", "files": status})


@app.post("/api/contact")
def contact():
    ip = client_ip()
    if not contact_rate_allowed(ip):
        return jsonify({"error": "Demasiados mensajes. Intentá nuevamente más tarde."}), 429

    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()[:120]
    email = str(payload.get("email", "")).strip()[:180]
    message = str(payload.get("message", "")).strip()[:5000]
    if not name or not email or "@" not in email or not message:
        return jsonify({"error": "Nombre, email y mensaje son obligatorios."}), 400

    row = {
        "name": name,
        "email": email,
        "company": str(payload.get("company", "")).strip()[:180] or None,
        "project_type": str(payload.get("project_type", "")).strip()[:100] or None,
        "message": message,
        "language": str(payload.get("language", "es"))[:5],
        "user_agent": request.headers.get("User-Agent", "")[:500],
    }
    if configured():
        try:
            sb_rest("portfolio_contact_messages", method="POST", body=row, prefer="return=minimal")
        except Exception as exc:
            app.logger.error("Contact insert failed: %s", exc)
            return jsonify({"error": "No se pudo guardar el mensaje."}), 503
    else:
        app.logger.info("CONTACT FALLBACK %s", row)
    return jsonify({"ok": True}), 201


@app.post("/api/auth/login")
def auth_login():
    if not configured():
        return jsonify({"error": "Configurá SUPABASE_ANON_KEY antes de usar el panel admin."}), 503
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip()
    password = str(payload.get("password", ""))
    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios."}), 400
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token",
        params={"grant_type": "password"},
        headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=12,
    )
    if response.status_code != 200:
        try:
            detail = response.json().get("error_description") or response.json().get("msg")
        except Exception:
            detail = "Credenciales inválidas"
        return jsonify({"error": detail or "Credenciales inválidas"}), 401
    auth = response.json()
    try:
        token = auth["access_token"]
        user = get_user(token)
        rows = sb_rest("portfolio_admins", params={"select": "user_id", "user_id": f"eq.{user['id']}", "limit": "1"}, token=token)
        if not rows:
            return jsonify({"error": "La cuenta existe pero no está autorizada como administradora."}), 403
    except Exception as exc:
        return jsonify({"error": str(exc)}), 403
    return jsonify({"access_token": token, "expires_in": auth.get("expires_in"), "user": {"id": user.get("id"), "email": user.get("email")}})


@app.get("/api/admin/me")
def admin_me():
    try:
        _token, user = require_admin()
        return jsonify({"user": {"id": user.get("id"), "email": user.get("email")}})
    except PermissionError as exc:
        return jsonify({"error": str(exc)}), 401
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503


@app.get("/api/admin/bootstrap")
def admin_bootstrap():
    try:
        token, _user = require_admin()
        profile = sb_rest("portfolio_profile", params={"select": "*", "id": "eq.main", "limit": "1"}, token=token)
        projects = sb_rest("portfolio_projects", params={"select": "*", "order": "sort_order.asc"}, token=token)
        experiences = sb_rest("portfolio_experiences", params={"select": "*", "order": "sort_order.asc"}, token=token)
        messages = sb_rest("portfolio_contact_messages", params={"select": "*", "order": "created_at.desc", "limit": "100"}, token=token)
        return jsonify({"profile": profile[0] if profile else {}, "projects": projects, "experiences": experiences, "messages": messages})
    except PermissionError as exc:
        return jsonify({"error": str(exc)}), 401
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503


@app.patch("/api/admin/profile")
def admin_profile_update():
    try:
        token, _user = require_admin()
        payload = request.get_json(silent=True) or {}
        allowed = {
            "name", "eyebrow_es", "eyebrow_en", "headline_es", "headline_en",
            "summary_es", "summary_en", "location_es", "location_en", "email",
            "linkedin_url", "github_url", "cv_es_url", "cv_en_url", "photo_url",
            "availability", "crypto_note_es", "crypto_note_en",
        }
        cleaned = {k: v for k, v in payload.items() if k in allowed}
        out = sb_rest("portfolio_profile", method="PATCH", params={"id": "eq.main"}, body=cleaned, token=token, prefer="return=representation")
        clear_public_cache()
        return jsonify(out[0] if out else {"ok": True})
    except PermissionError as exc:
        return jsonify({"error": str(exc)}), 401
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503


@app.post("/api/admin/<resource>")
def admin_create(resource: str):
    if resource not in ADMIN_RESOURCES:
        return jsonify({"error": "Recurso no permitido"}), 404
    try:
        token, _user = require_admin()
        cleaned = clean_payload(resource, request.get_json(silent=True) or {})
        if not cleaned:
            return jsonify({"error": "No hay campos válidos"}), 400
        out = sb_rest(ADMIN_RESOURCES[resource], method="POST", body=cleaned, token=token, prefer="return=representation")
        clear_public_cache()
        return jsonify(out[0] if out else {"ok": True}), 201
    except PermissionError as exc:
        return jsonify({"error": str(exc)}), 401
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503


@app.patch("/api/admin/<resource>/<record_id>")
def admin_update(resource: str, record_id: str):
    if resource not in ADMIN_RESOURCES:
        return jsonify({"error": "Recurso no permitido"}), 404
    try:
        token, _user = require_admin()
        cleaned = clean_payload(resource, request.get_json(silent=True) or {})
        out = sb_rest(ADMIN_RESOURCES[resource], method="PATCH", params={"id": f"eq.{record_id}"}, body=cleaned, token=token, prefer="return=representation")
        clear_public_cache()
        return jsonify(out[0] if out else {"ok": True})
    except PermissionError as exc:
        return jsonify({"error": str(exc)}), 401
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503


@app.delete("/api/admin/<resource>/<record_id>")
def admin_delete(resource: str, record_id: str):
    if resource not in ADMIN_RESOURCES:
        return jsonify({"error": "Recurso no permitido"}), 404
    try:
        token, _user = require_admin()
        sb_rest(ADMIN_RESOURCES[resource], method="DELETE", params={"id": f"eq.{record_id}"}, token=token, prefer="return=minimal")
        clear_public_cache()
        return jsonify({"ok": True})
    except PermissionError as exc:
        return jsonify({"error": str(exc)}), 401
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503


@app.post("/api/admin/upload")
def admin_upload():
    try:
        token, _user = require_admin()
        if "file" not in request.files:
            return jsonify({"error": "Falta archivo"}), 400
        file = request.files["file"]
        if not file.filename:
            return jsonify({"error": "Archivo vacío"}), 400
        if not (file.mimetype or "").startswith("image/"):
            return jsonify({"error": "En v1.0 sólo se aceptan imágenes"}), 400
        name = secure_filename(file.filename) or "image.jpg"
        object_path = f"projects/{uuid.uuid4().hex[:10]}-{name}"
        data = file.read()
        url = f"{SUPABASE_URL}/storage/v1/object/portfolio-media/{object_path}"
        response = requests.post(
            url,
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {token}",
                "Content-Type": file.mimetype or "application/octet-stream",
                "x-upsert": "true",
            },
            data=data,
            timeout=25,
        )
        if response.status_code >= 400:
            return jsonify({"error": f"Storage {response.status_code}: {response.text[:500]}"}), 503
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/portfolio-media/{object_path}"
        return jsonify({"ok": True, "path": object_path, "public_url": public_url}), 201
    except PermissionError as exc:
        return jsonify({"error": str(exc)}), 401
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503


@app.get("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/admin.html")
def admin_page():
    return send_from_directory(FRONTEND_DIR, "admin.html")


@app.get("/<path:path>")
def frontend_files(path: str):
    candidate = FRONTEND_DIR / path
    if candidate.exists() and candidate.is_file():
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.errorhandler(413)
def too_large(_err):
    return jsonify({"error": f"Archivo demasiado grande. Máximo {MAX_UPLOAD_MB} MB."}), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=os.getenv("FLASK_DEBUG", "0") == "1")
