import json
import logging
try:
    from toon_format import encode, decode, estimate_savings
except Exception:
    # Some versions of toon_format may not provide estimate_savings
    from toon_format import encode, decode
    estimate_savings = None

logger = logging.getLogger(__name__)


def to_toon(data: dict) -> str:
    try:
        return encode(data, {"delimiter": "\t", "indent": 2})
    except NotImplementedError:
        logger.warning("[TOON] installed encoder not implemented, falling back to simple encoder")
    except Exception as e:
        # Any other error from the external encoder -> fallback
        logger.warning("[TOON] external encode failed: %s", e)

    # Fallback simple encoder: key=value pairs joined by tabs
    def _escape(v: str) -> str:
        return v.replace("\\", "\\\\").replace("\t", "\\t").replace("=", "\\=")

    parts = []
    for k, v in (data or {}).items():
        if isinstance(v, (dict, list)):
            val = json.dumps(v, separators=(",", ":"))
        else:
            val = "" if v is None else str(v)
        parts.append(f"{k}={_escape(val)}")
    return "\t".join(parts)


def from_toon(toon_string: str) -> dict:
    if not toon_string or not toon_string.strip():
        return {}
    try:
        return decode(toon_string, {"strict": False, "indent": 2}) or {}
    except Exception as e:
        logger.warning("[TOON] external decode failed: %s", e)

    # Fallback simple decoder matching the simple encoder above
    try:
        out: dict = {}
        for part in toon_string.split("\t"):
            if "=" not in part:
                continue
            k, v = part.split("=", 1)
            v = v.replace("\\=", "=").replace("\\t", "\t").replace("\\\\", "\\")
            try:
                out[k] = json.loads(v)
            except Exception:
                out[k] = v
        return out
    except Exception as e:
        logger.warning("[TOON] fallback decode failed: %s", e)
        return {}


def token_savings(data: dict) -> dict:
    try:
        if callable(estimate_savings):
            report = estimate_savings(data)
            return {
                "json_chars": len(json.dumps(data, indent=2)),
                "toon_chars": len(to_toon(data)),
                "saved_percent": round(report.get("savings_percent", 0), 1),
                "estimated_tokens_saved": report.get("tokens_saved", 0),
            }
    except Exception as e:
        logger.warning("[TOON] external estimate_savings failed: %s", e)

    # Fallback estimator
    try:
        json_str = json.dumps(data, indent=2)
        toon_str = to_toon(data)
        saved = len(json_str) - len(toon_str)
        return {
            "json_chars": len(json_str),
            "toon_chars": len(toon_str),
            "saved_percent": round((saved / len(json_str)) * 100, 1) if len(json_str) else 0,
            "estimated_tokens_saved": round(saved / 4),
        }
    except Exception as e:
        logger.warning("[TOON] fallback token_savings failed: %s", e)
        return {"json_chars": 0, "toon_chars": 0, "saved_percent": 0, "estimated_tokens_saved": 0}