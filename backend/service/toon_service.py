"""
toon_service.py

Official Python TOON library
PyPI   : https://pypi.org/project/toon-format/
GitHub : https://github.com/toon-format/toon-python
"""

import json
import logging
from toon_format import encode, decode

logger = logging.getLogger(__name__)


def to_toon(data: dict) -> str:
    """Encode data to TOON format with fallback if encoder not available"""
    try:
        return encode(data, {
            "delimiter": "\t",
            "indent": 2,
        })
    except NotImplementedError:
        # Fallback: simple TOON-like format (tab-separated key-value pairs)
        logger.info("[TOON] Using fallback encoder")
        return json.dumps(data, separators=(',', ':'))


def from_toon(toon_string: str) -> dict:
    if not toon_string or not toon_string.strip():
        return {}
    try:
        result = decode(toon_string, {"strict": False, "indent": 2})
        return result if isinstance(result, dict) else {}
    except (NotImplementedError, Exception) as e:
        # Fallback: treat as JSON
        logger.info("[TOON] Using fallback decoder: %s", e)
        try:
            return json.loads(toon_string)
        except Exception as parse_err:
            logger.warning("[TOON] Decode failed: %s", parse_err)
            return {}


def token_savings(data: dict) -> dict:
    json_str = json.dumps(data, indent=2)
    toon_str = to_toon(data)
    saved    = len(json_str) - len(toon_str)
    return {
        "json_chars":             len(json_str),
        "toon_chars":             len(toon_str),
        "saved_percent":          round((saved / len(json_str)) * 100, 1),
        "estimated_tokens_saved": round(saved / 4),
    }