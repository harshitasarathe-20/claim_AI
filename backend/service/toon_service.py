"""
toon_service.py
Converts data to/from TOON format for token-efficient LLM calls.
TOON = Token-Oriented Object Notation
Format: key:value|key:value|key.nested:value|list_key:a,b,c
"""


def to_toon(data: dict, prefix: str = "") -> str:
    """
    Convert a Python dictionary to TOON string.
    
    Example:
        {"name": "Rahul", "car": {"make": "Toyota"}, "images": ["a.jpg", "b.jpg"]}
        becomes:
        "name:Rahul|car.make:Toyota|images:a.jpg,b.jpg"
    """
    parts = []

    for key, value in data.items():
        full_key = f"{prefix}.{key}" if prefix else key

        if isinstance(value, dict):
            # Nested dict — recurse with dot notation
            nested = to_toon(value, prefix=full_key)
            parts.append(nested)

        elif isinstance(value, list):
            if len(value) == 0:
                parts.append(f"{full_key}:")
            elif isinstance(value[0], dict):
                # List of dicts — index them
                for i, item in enumerate(value):
                    nested = to_toon(item, prefix=f"{full_key}[{i}]")
                    parts.append(nested)
            else:
                # Simple list — join with comma
                parts.append(f"{full_key}:{','.join(str(v) for v in value)}")

        elif value is None:
            parts.append(f"{full_key}:null")

        elif isinstance(value, bool):
            parts.append(f"{full_key}:{'true' if value else 'false'}")

        else:
            # String, int, float
            parts.append(f"{full_key}:{value}")

    return "|".join(parts)


def from_toon(toon_string: str) -> dict:
    """
    Convert a TOON string back to a Python dictionary.
    
    Example:
        "damage_location:front|severity:Moderate|fraud_risk:Low|confidence_score:82"
        becomes:
        {"damage_location": "front", "severity": "Moderate", ...}
    """
    result = {}

    if not toon_string or not toon_string.strip():
        return result

    pairs = toon_string.strip().split("|")

    for pair in pairs:
        if ":" not in pair:
            continue

        key, _, value = pair.partition(":")
        key = key.strip()
        value = value.strip()

        # Try to convert to number if possible
        if value.isdigit():
            result[key] = int(value)
        else:
            try:
                result[key] = float(value)
            except ValueError:
                # Keep as string
                if value == "null":
                    result[key] = None
                elif value == "true":
                    result[key] = True
                elif value == "false":
                    result[key] = False
                else:
                    result[key] = value

    return result


def token_savings_estimate(json_string: str, toon_string: str) -> dict:
    """
    Shows how many characters (roughly tokens) you saved.
    Rough estimate: 1 token ≈ 4 characters for English text.
    """
    json_chars = len(json_string)
    toon_chars = len(toon_string)
    saved = json_chars - toon_chars
    percent = round((saved / json_chars) * 100, 1) if json_chars > 0 else 0

    return {
        "json_characters": json_chars,
        "toon_characters": toon_chars,
        "characters_saved": saved,
        "percent_reduction": percent,
        "estimated_tokens_saved": round(saved / 4)
    }