"""
Lightweight Supabase client using httpx — drop-in replacement for the heavy
`supabase` Python SDK.  Only implements the PostgREST query-builder and
Storage APIs actually used in this project.

This keeps the Vercel serverless function well under the 250 MB limit.
"""

import httpx
import json
from urllib.parse import quote as urlquote

_TIMEOUT = 30.0


# ---- helpers ---------------------------------------------------------------

class _Response:
    """Mimics the `APIResponse` returned by the official SDK."""
    def __init__(self, data):
        self.data = data


# ---- PostgREST query builder -----------------------------------------------

class _QueryBuilder:
    """Chainable query builder that mirrors the supabase-py `.table()` API."""

    def __init__(self, url: str, headers: dict, table: str):
        self._base = f"{url}/rest/v1/{urlquote(table)}"
        self._headers = {**headers, "Content-Type": "application/json"}
        self._params: list[tuple[str, str]] = []
        self._method = "GET"
        self._body = None
        self._prefer: list[str] = []

    # --- query verbs ---

    def select(self, columns: str = "*"):
        self._method = "GET"
        self._params.append(("select", columns))
        return self

    def insert(self, data: dict):
        self._method = "POST"
        self._body = data
        self._prefer.append("return=representation")
        return self

    def update(self, data: dict):
        self._method = "PATCH"
        self._body = data
        self._prefer.append("return=representation")
        return self

    def delete(self):
        self._method = "DELETE"
        self._prefer.append("return=representation")
        return self

    # --- filters ---

    def eq(self, column: str, value):
        self._params.append((column, f"eq.{value}"))
        return self

    def neq(self, column: str, value):
        self._params.append((column, f"neq.{value}"))
        return self

    def gte(self, column: str, value):
        self._params.append((column, f"gte.{value}"))
        return self

    def lte(self, column: str, value):
        self._params.append((column, f"lte.{value}"))
        return self

    def ilike(self, column: str, pattern: str):
        self._params.append((column, f"ilike.{pattern}"))
        return self

    def in_(self, column: str, values: list):
        formatted = ",".join(str(v) for v in values)
        self._params.append((column, f"in.({formatted})"))
        return self

    # --- modifiers ---

    def order(self, column: str, *, desc: bool = False):
        direction = "desc" if desc else "asc"
        self._params.append(("order", f"{column}.{direction}"))
        return self

    def limit(self, n: int):
        self._params.append(("limit", str(n)))
        return self

    # --- execute ---

    def execute(self) -> _Response:
        headers = {**self._headers}
        if self._prefer:
            headers["Prefer"] = ", ".join(self._prefer)

        with httpx.Client(timeout=_TIMEOUT) as client:
            if self._method == "GET":
                r = client.get(self._base, headers=headers, params=self._params)
            elif self._method == "POST":
                r = client.post(self._base, headers=headers, params=self._params, json=self._body)
            elif self._method == "PATCH":
                r = client.patch(self._base, headers=headers, params=self._params, json=self._body)
            elif self._method == "DELETE":
                r = client.delete(self._base, headers=headers, params=self._params)
            else:
                raise ValueError(f"Unsupported method: {self._method}")

        if r.status_code >= 400:
            raise RuntimeError(f"PostgREST error {r.status_code}: {r.text}")

        try:
            data = r.json()
        except Exception:
            data = []

        return _Response(data if isinstance(data, list) else [data] if data else [])


# ---- Storage ---------------------------------------------------------------

class _BucketClient:
    """Minimal Supabase Storage bucket client."""

    def __init__(self, url: str, headers: dict, bucket: str):
        self._url = f"{url}/storage/v1"
        self._headers = headers
        self._bucket = bucket

    def download(self, path: str) -> bytes:
        r = httpx.get(
            f"{self._url}/object/{self._bucket}/{path}",
            headers=self._headers,
            timeout=_TIMEOUT,
        )
        if r.status_code >= 400:
            raise RuntimeError(f"Storage download error {r.status_code}: {r.text}")
        return r.content

    def upload(self, path: str, data: bytes, file_options: dict | None = None):
        headers = {**self._headers}
        content_type = "application/octet-stream"
        if file_options and "content-type" in file_options:
            content_type = file_options["content-type"]
        headers["Content-Type"] = content_type
        r = httpx.post(
            f"{self._url}/object/{self._bucket}/{path}",
            headers=headers,
            content=data,
            timeout=60.0,
        )
        if r.status_code >= 400:
            raise RuntimeError(f"Storage upload error {r.status_code}: {r.text}")
        return r.json()

    def remove(self, paths: list[str]):
        r = httpx.delete(
            f"{self._url}/object/{self._bucket}",
            headers={**self._headers, "Content-Type": "application/json"},
            json={"prefixes": paths},
            timeout=_TIMEOUT,
        )
        if r.status_code >= 400:
            raise RuntimeError(f"Storage remove error {r.status_code}: {r.text}")
        return r.json() if r.content else []


class _StorageClient:
    """Minimal Supabase Storage client."""

    def __init__(self, url: str, headers: dict):
        self._url = url
        self._headers = headers

    def from_(self, bucket: str) -> _BucketClient:
        return _BucketClient(self._url, self._headers, bucket)

    def get_bucket(self, bucket_id: str):
        r = httpx.get(
            f"{self._url}/storage/v1/bucket/{bucket_id}",
            headers=self._headers,
            timeout=_TIMEOUT,
        )
        if r.status_code >= 400:
            raise RuntimeError(f"Bucket not found: {r.status_code}")
        return r.json()

    def create_bucket(self, bucket_id: str, options: dict | None = None):
        body: dict = {"id": bucket_id, "name": bucket_id}
        if options:
            body["public"] = options.get("public", False)
        r = httpx.post(
            f"{self._url}/storage/v1/bucket",
            headers={**self._headers, "Content-Type": "application/json"},
            json=body,
            timeout=_TIMEOUT,
        )
        if r.status_code >= 400:
            raise RuntimeError(f"Bucket create error {r.status_code}: {r.text}")
        return r.json()


# ---- Main client -----------------------------------------------------------

class SupabaseLiteClient:
    """Drop-in replacement for `supabase.create_client(url, key)`.
    Supports `.table(name)` and `.storage`."""

    def __init__(self, url: str, key: str):
        self._url = url.rstrip("/")
        self._headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
        }
        self.storage = _StorageClient(self._url, self._headers)

    def table(self, name: str) -> _QueryBuilder:
        return _QueryBuilder(self._url, self._headers, name)


def create_client(url: str, key: str) -> SupabaseLiteClient:
    """Factory — mirrors `supabase.create_client`."""
    return SupabaseLiteClient(url, key)
