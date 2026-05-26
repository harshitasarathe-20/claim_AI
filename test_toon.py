from app.service.toon_service import to_toon, from_toon, token_savings_estimate
import json

# Test data
claim = {
    "customer_name": "Rahul Sharma",
    "claim_amount": 85000,
    "damage_desc": "Front bumper and bonnet damaged in rear-end collision",
    "status": "PENDING",
    "images": ["front.jpg", "rear.jpg", "side.jpg"]
}

# Convert to TOON
toon = to_toon(claim)
print("TOON output:")
print(toon)
print()

# Convert back
recovered = from_toon(toon)
print("Recovered dict:")
print(recovered)
print()

# Show savings
json_str = json.dumps(claim)
savings = token_savings_estimate(json_str, toon)
print("Token savings:")
print(f"  JSON : {savings['json_characters']} characters")
print(f"  TOON : {savings['toon_characters']} characters")
print(f"  Saved: {savings['percent_reduction']}% (~{savings['estimated_tokens_saved']} tokens)")