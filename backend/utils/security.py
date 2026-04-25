import os
import uuid
from fastapi import Request


DEFAULT_USER_ID = os.getenv("DEFAULT_USER_ID", "00000000-0000-0000-0000-000000000001")
DEFAULT_USER_ROLE = os.getenv("DEFAULT_USER_ROLE", "base")


def _normalize_user_id(value: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return DEFAULT_USER_ID
    try:
        return str(uuid.UUID(raw))
    except ValueError:
        # Keep deterministic UUID for any non-UUID header value.
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, raw))


async def get_current_user(request: Request) -> dict:
    """
    Authentication is intentionally disabled.
    Endpoints receive a technical user context without JWT validation.
    """
    user_id = _normalize_user_id(request.headers.get("X-User-Id") or DEFAULT_USER_ID)
    role = str(request.headers.get("X-User-Role") or DEFAULT_USER_ROLE).strip() or "base"
    return {"user_id": user_id, "role": role}
