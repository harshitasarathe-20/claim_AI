"""
toon_service.py

Official Python TOON library
PyPI   : https://pypi.org/project/toon-format/
GitHub : https://github.com/toon-format/toon-python
"""

import json
import logging
from toon_format import encode, decode, estimate_savings

logger = logging.getLogger(__name__)


def to_toon(data: dict) -> str:
    return encode(data, {
        "delimiter": "\t",
        "indent": 2,
    })


def from_toon(toon_string: str) -> dict:
    if not toon_string or not toon_string.strip():
        return {}
    try:
        result = decode(toon_string, {"strict": False, "indent": 2})
        return result if isinstance(result, dict) else {}
    except Exception as e:
        logger.warning("[TOON] Decode failed: %s", e)
        return {}


def token_savings(data: dict) -> dict:
    try:
        report   = estimate_savings(data)
        return {
            "json_chars":             len(json.dumps(data, indent=2)),
            "toon_chars":             len(to_toon(data)),
            "saved_percent":          round(report.get("savings_percent", 0), 1),
            "estimated_tokens_saved": report.get("tokens_saved", 0),
        }
    except Exception as e:
        logger.warning("[TOON] estimate_savings failed: %s", e)
        json_str = json.dumps(data, indent=2)
        toon_str = to_toon(data)
        saved    = len(json_str) - len(toon_str)
        return {
            "json_chars":             len(json_str),
            "toon_chars":             len(toon_str),
            "saved_percent":          round((saved / len(json_str)) * 100, 1),
            "estimated_tokens_saved": round(saved / 4),
        }